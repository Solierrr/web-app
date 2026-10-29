import { app, firebaseConfig } from "@/config/firebase/firebase";
import i18n from "@/config/i18n/internationalization";
import logger from "@/config/logging/logger";
import { createServiceError } from "@/config/logging/serviceError.utils";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { PushStatus } from "./notification.enum";
import { isNotificationNotFound, registerDevice, removeDevice } from "./notification.service";
import { browserVersionLabel } from "./notification.utils";

export const SERVICE_WORKER_PATH = "/firebase-messaging-sw.js";
export const SERVICE_WORKER_SCOPE = "/firebase-cloud-messaging-push-scope";

const DEVICE_KEY = "solaria.push.device";
const STALE_TOKEN_CODES = ["messaging/token-subscribe-failed", "messaging/token-unsubscribe-failed"];

interface StoredDevice {
  userId: string;
  installationId: string;
}

let syncedUserId: string | null = null;
let syncing: Promise<void> | null = null;

function vapidKey(): string {
  return (import.meta.env.VITE_FIREBASE_VAPID_KEY ?? "").trim();
}

function optOutKey(userId: string): string {
  return `solaria.push.optout.${userId}`;
}

function mockKey(userId: string): string {
  return `solaria.push.mock.${userId}`;
}

function readDevice(): StoredDevice | null {
  try {
    const stored = JSON.parse(localStorage.getItem(DEVICE_KEY) ?? "null") as Partial<StoredDevice> | null;
    return stored && typeof stored.userId === "string" && typeof stored.installationId === "string" ? (stored as StoredDevice) : null;
  } catch {
    return null;
  }
}

function writeDevice(device: StoredDevice | null): void {
  try {
    if (device) localStorage.setItem(DEVICE_KEY, JSON.stringify(device));
    else localStorage.removeItem(DEVICE_KEY);
  } catch (error) {
    logger.serviceError({ service: "push", operation: "storeDevice", error });
  }
}

function errorCode(error: unknown): string {
  return typeof error === "object" && error !== null && "code" in error ? String((error as { code: unknown }).code) : "";
}

async function browserSupportsPush(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) return false;
  try {
    const { isSupported } = await import("firebase/messaging");
    return await isSupported();
  } catch {
    return false;
  }
}

export async function getPushStatus(): Promise<PushStatus> {
  const userId = getAuthSession()?.userId ?? "anonymous";
  if (isAlwaysMockMode("NOTIFY")) return localStorage.getItem(mockKey(userId)) ? PushStatus.ON : PushStatus.OFF;
  if (!vapidKey()) return PushStatus.UNCONFIGURED;
  if (!(await browserSupportsPush())) return PushStatus.UNSUPPORTED;
  if (Notification.permission === "denied") return PushStatus.BLOCKED;
  if (Notification.permission === "granted" && !localStorage.getItem(optOutKey(userId))) return PushStatus.ON;
  return PushStatus.OFF;
}

function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  const { apiKey, projectId, messagingSenderId, appId } = firebaseConfig;
  const query = new URLSearchParams({ apiKey, projectId, messagingSenderId, appId });
  return navigator.serviceWorker.register(`${SERVICE_WORKER_PATH}?${query}`, { scope: SERVICE_WORKER_SCOPE });
}

async function registerCurrentDevice(): Promise<void> {
  const session = getAuthSession();
  if (!session) return;
  const [{ getMessaging, getToken, deleteToken }, { getInstallations, getId }] = await Promise.all([
    import("firebase/messaging"),
    import("firebase/installations"),
  ]);
  const messaging = getMessaging(app);
  const options = { vapidKey: vapidKey(), serviceWorkerRegistration: await registerServiceWorker() };
  let token: string;
  try {
    token = await getToken(messaging, options);
  } catch (error) {
    if (!STALE_TOKEN_CODES.includes(errorCode(error))) throw error;
    await deleteToken(messaging).catch(() => false);
    token = await getToken(messaging, options);
  }
  const installationId = await getId(getInstallations(app));
  await registerDevice(installationId, { fcmToken: token, platform: "WEB", appVersion: browserVersionLabel(navigator.userAgent) });
  writeDevice({ userId: session.userId, installationId });
}

export async function enablePush(): Promise<PushStatus> {
  const userId = getAuthSession()?.userId ?? "anonymous";
  if (isAlwaysMockMode("NOTIFY")) {
    localStorage.setItem(mockKey(userId), "1");
    return PushStatus.ON;
  }
  const status = await getPushStatus();
  if (status === PushStatus.UNCONFIGURED || status === PushStatus.UNSUPPORTED || status === PushStatus.BLOCKED) return status;
  const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
  if (permission === "denied") return PushStatus.BLOCKED;
  if (permission !== "granted") return PushStatus.OFF;
  localStorage.removeItem(optOutKey(userId));
  try {
    await registerCurrentDevice();
  } catch (error) {
    if (errorCode(error) === "messaging/permission-blocked") return PushStatus.BLOCKED;
    throw createServiceError("push", "enablePush", i18n.t("services:notifications.enablePush"), error);
  }
  syncedUserId = userId;
  return PushStatus.ON;
}

export async function removePushRegistration(): Promise<void> {
  const session = getAuthSession();
  const device = readDevice();
  if (!session || !device || device.userId !== session.userId) return;
  syncedUserId = null;
  if (isAlwaysMockMode("NOTIFY")) {
    writeDevice(null);
    return;
  }
  try {
    await removeDevice(device.installationId);
  } catch (error) {
    if (!isNotificationNotFound(error)) throw error;
  }
  writeDevice(null);
  try {
    const { getMessaging, deleteToken } = await import("firebase/messaging");
    await deleteToken(getMessaging(app));
  } catch (error) {
    logger.serviceError({ service: "push", operation: "deleteToken", error });
  }
}

export async function disablePush(): Promise<PushStatus> {
  const userId = getAuthSession()?.userId ?? "anonymous";
  if (isAlwaysMockMode("NOTIFY")) {
    localStorage.removeItem(mockKey(userId));
    return PushStatus.OFF;
  }
  try {
    await removePushRegistration();
  } catch (error) {
    throw createServiceError("push", "disablePush", i18n.t("services:notifications.disablePush"), error);
  }
  localStorage.setItem(optOutKey(userId), "1");
  return PushStatus.OFF;
}

export function syncPushRegistration(): Promise<void> {
  const userId = getAuthSession()?.userId;
  if (!userId || syncedUserId === userId || isAlwaysMockMode("NOTIFY")) return Promise.resolve();
  if (syncing) return syncing;
  syncing = (async () => {
    try {
      if ((await getPushStatus()) !== PushStatus.ON) return;
      await registerCurrentDevice();
      syncedUserId = userId;
    } catch (error) {
      logger.serviceError({ service: "push", operation: "syncPushRegistration", error });
    } finally {
      syncing = null;
    }
  })();
  return syncing;
}

export async function subscribeToForegroundPush(handler: (data: Record<string, string>) => void): Promise<() => void> {
  if (isAlwaysMockMode("NOTIFY") || (await getPushStatus()) !== PushStatus.ON) return () => undefined;
  const { getMessaging, onMessage } = await import("firebase/messaging");
  return onMessage(getMessaging(app), (message) => handler(message.data ?? {}));
}
