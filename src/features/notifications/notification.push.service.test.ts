import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HttpResponseError } from "@/lib/shared/http/http.service";
import { PushStatus } from "./notification.enum";

const mocks = vi.hoisted(() => ({
  isSupported: vi.fn(),
  getToken: vi.fn(),
  deleteToken: vi.fn(),
  onMessage: vi.fn(),
  getId: vi.fn(),
  registerDevice: vi.fn(),
  removeDevice: vi.fn(),
  register: vi.fn(),
  requestPermission: vi.fn(),
}));

vi.mock("firebase/messaging", () => ({
  isSupported: mocks.isSupported,
  getMessaging: () => ({ name: "messaging" }),
  getToken: mocks.getToken,
  deleteToken: mocks.deleteToken,
  onMessage: mocks.onMessage,
}));
vi.mock("firebase/installations", () => ({ getInstallations: () => ({ name: "installations" }), getId: mocks.getId }));
vi.mock("@/config/firebase/firebase", () => ({
  app: { name: "app" },
  firebaseConfig: { apiKey: "public-key", projectId: "project-1", messagingSenderId: "123", appId: "app-1", authDomain: "x", storageBucket: "y" },
}));
vi.mock("@/config/logging/logger", () => ({ default: { serviceError: vi.fn() } }));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => ({ accessToken: "access", userId: "user-1" }) }));
vi.mock("./notification.service", async () => {
  const actual = await vi.importActual<typeof import("./notification.service")>("./notification.service");
  return { ...actual, registerDevice: mocks.registerDevice, removeDevice: mocks.removeDevice };
});

import {
  disablePush,
  enablePush,
  getPushStatus,
  removePushRegistration,
  subscribeToForegroundPush,
  syncPushRegistration,
} from "./notification.push.service";

const registration = { scope: "scope" };

function stubBrowser(permission: NotificationPermission) {
  const notification = Object.assign(vi.fn(), { permission, requestPermission: mocks.requestPermission });
  vi.stubGlobal("Notification", notification);
  Object.defineProperty(navigator, "serviceWorker", { configurable: true, value: { register: mocks.register } });
}

async function freshModule() {
  vi.resetModules();
  return import("./notification.push.service");
}

describe("push registration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubEnv("VITE_FIREBASE_VAPID_KEY", "vapid-public-key");
    vi.stubEnv("VITE_NOTIFY_MOCKS", "DEACTIVATED");
    vi.stubEnv("VITE_MOCKS", "DEACTIVATED");
    mocks.isSupported.mockResolvedValue(true);
    mocks.getToken.mockResolvedValue("fcm-token");
    mocks.getId.mockResolvedValue("fid_123");
    mocks.deleteToken.mockResolvedValue(true);
    mocks.register.mockResolvedValue(registration);
    mocks.registerDevice.mockResolvedValue({});
    mocks.removeDevice.mockResolvedValue(undefined);
    mocks.requestPermission.mockResolvedValue("granted");
    stubBrowser("default");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("stays off without the vapid key and never asks for permission", async () => {
    vi.stubEnv("VITE_FIREBASE_VAPID_KEY", "  ");
    const module = await freshModule();
    expect(await module.getPushStatus()).toBe(PushStatus.UNCONFIGURED);
    expect(await module.enablePush()).toBe(PushStatus.UNCONFIGURED);
    await module.syncPushRegistration();
    expect(mocks.requestPermission).not.toHaveBeenCalled();
    expect(mocks.register).not.toHaveBeenCalled();
    expect(mocks.getToken).not.toHaveBeenCalled();
    expect(mocks.registerDevice).not.toHaveBeenCalled();
  });

  it("reports an unsupported browser without prompting", async () => {
    mocks.isSupported.mockResolvedValue(false);
    expect(await getPushStatus()).toBe(PushStatus.UNSUPPORTED);
    expect(await enablePush()).toBe(PushStatus.UNSUPPORTED);
    expect(mocks.requestPermission).not.toHaveBeenCalled();
  });

  it("reports blocked notifications and never retries the prompt", async () => {
    stubBrowser("denied");
    expect(await getPushStatus()).toBe(PushStatus.BLOCKED);
    expect(await enablePush()).toBe(PushStatus.BLOCKED);
    expect(mocks.requestPermission).not.toHaveBeenCalled();
    expect(mocks.getToken).not.toHaveBeenCalled();
  });

  it("asks for permission only when enabling, then registers the device as web", async () => {
    expect(await getPushStatus()).toBe(PushStatus.OFF);
    expect(mocks.requestPermission).not.toHaveBeenCalled();

    expect(await enablePush()).toBe(PushStatus.ON);

    expect(mocks.requestPermission).toHaveBeenCalledTimes(1);
    const [path, options] = mocks.register.mock.calls[0];
    expect(path).toContain("/firebase-messaging-sw.js?");
    expect(new URLSearchParams(path.split("?")[1]).get("projectId")).toBe("project-1");
    expect(options).toEqual({ scope: "/firebase-cloud-messaging-push-scope" });
    expect(mocks.getToken).toHaveBeenCalledWith({ name: "messaging" }, { vapidKey: "vapid-public-key", serviceWorkerRegistration: registration });
    expect(mocks.registerDevice).toHaveBeenCalledWith("fid_123", { fcmToken: "fcm-token", platform: "WEB", appVersion: expect.any(String) });
  });

  it("does not register when the user dismisses or denies the prompt", async () => {
    mocks.requestPermission.mockResolvedValueOnce("denied");
    expect(await enablePush()).toBe(PushStatus.BLOCKED);
    mocks.requestPermission.mockResolvedValueOnce("default");
    expect(await enablePush()).toBe(PushStatus.OFF);
    expect(mocks.getToken).not.toHaveBeenCalled();
    expect(mocks.registerDevice).not.toHaveBeenCalled();
  });

  it("maps a permission error from firebase to blocked and any other failure to a service error", async () => {
    mocks.getToken.mockRejectedValueOnce(Object.assign(new Error("blocked"), { code: "messaging/permission-blocked" }));
    expect(await enablePush()).toBe(PushStatus.BLOCKED);
    mocks.getToken.mockRejectedValueOnce(Object.assign(new Error("boom"), { code: "messaging/failed-service-worker-registration" }));
    await expect(enablePush()).rejects.toThrow("Não foi possível ativar as notificações neste dispositivo");
  });

  it("recovers from a stale token by deleting it and asking for a new one", async () => {
    mocks.getToken
      .mockRejectedValueOnce(Object.assign(new Error("stale"), { code: "messaging/token-subscribe-failed" }))
      .mockResolvedValueOnce("fresh-token");
    expect(await enablePush()).toBe(PushStatus.ON);
    expect(mocks.deleteToken).toHaveBeenCalledTimes(1);
    expect(mocks.registerDevice).toHaveBeenCalledWith("fid_123", expect.objectContaining({ fcmToken: "fresh-token" }));
  });

  it("registers again on the next session start only once per user and only with permission granted", async () => {
    const module = await freshModule();
    await module.syncPushRegistration();
    expect(mocks.registerDevice).not.toHaveBeenCalled();

    stubBrowser("granted");
    await Promise.all([module.syncPushRegistration(), module.syncPushRegistration()]);
    await module.syncPushRegistration();
    expect(mocks.registerDevice).toHaveBeenCalledTimes(1);

    const next = await freshModule();
    mocks.getToken.mockResolvedValueOnce("rotated-token");
    await next.syncPushRegistration();
    expect(mocks.registerDevice).toHaveBeenLastCalledWith("fid_123", expect.objectContaining({ fcmToken: "rotated-token" }));
  });

  it("keeps a failed sync silent and lets a later one retry", async () => {
    stubBrowser("granted");
    const module = await freshModule();
    mocks.registerDevice.mockRejectedValueOnce(new Error("offline"));
    await expect(module.syncPushRegistration()).resolves.toBeUndefined();
    await module.syncPushRegistration();
    expect(mocks.registerDevice).toHaveBeenCalledTimes(2);
  });

  it("removes the device and the token at logout, tolerating a device the api no longer has", async () => {
    await enablePush();
    mocks.removeDevice.mockRejectedValueOnce(new Error("not found", { cause: new HttpResponseError(404, "NOT_FOUND") }));
    await removePushRegistration();
    expect(mocks.removeDevice).toHaveBeenCalledWith("fid_123");
    expect(mocks.deleteToken).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("solaria.push.device")).toBeNull();

    mocks.removeDevice.mockClear();
    await removePushRegistration();
    expect(mocks.removeDevice).not.toHaveBeenCalled();
  });

  it("does nothing at logout when this browser never registered a device", async () => {
    await removePushRegistration();
    expect(mocks.removeDevice).not.toHaveBeenCalled();
    expect(mocks.getToken).not.toHaveBeenCalled();
  });

  it("keeps the record and reports the failure when the api cannot remove the device", async () => {
    await enablePush();
    mocks.removeDevice.mockRejectedValueOnce(new Error("offline"));
    await expect(removePushRegistration()).rejects.toThrow("offline");
    expect(localStorage.getItem("solaria.push.device")).not.toBeNull();
    expect(mocks.deleteToken).not.toHaveBeenCalled();
  });

  it("turns push off for this user, removes the device and stops registering at the next start", async () => {
    stubBrowser("granted");
    await enablePush();
    expect(await disablePush()).toBe(PushStatus.OFF);
    expect(mocks.removeDevice).toHaveBeenCalledWith("fid_123");
    expect(await getPushStatus()).toBe(PushStatus.OFF);

    mocks.registerDevice.mockClear();
    const module = await freshModule();
    await module.syncPushRegistration();
    expect(mocks.registerDevice).not.toHaveBeenCalled();

    expect(await enablePush()).toBe(PushStatus.ON);
    expect(await getPushStatus()).toBe(PushStatus.ON);
  });

  it("forwards foreground data messages only while push is on", async () => {
    const handler = vi.fn();
    const unsubscribe = vi.fn();
    mocks.onMessage.mockImplementation((_messaging, listener: (message: unknown) => void) => {
      listener({ data: { notificationId: "n-1", type: "NEW_MESSAGE" } });
      return unsubscribe;
    });

    const off = await subscribeToForegroundPush(handler);
    expect(mocks.onMessage).not.toHaveBeenCalled();
    expect(off).toBeTypeOf("function");

    stubBrowser("granted");
    const stop = await subscribeToForegroundPush(handler);
    expect(handler).toHaveBeenCalledWith({ notificationId: "n-1", type: "NEW_MESSAGE" });
    expect(stop).toBe(unsubscribe);
  });

  it("simulates push in mock mode without browser apis", async () => {
    vi.stubEnv("VITE_NOTIFY_MOCKS", "ALWAYS");
    vi.stubEnv("VITE_FIREBASE_VAPID_KEY", "");
    vi.stubGlobal("Notification", undefined);
    expect(await getPushStatus()).toBe(PushStatus.OFF);
    expect(await enablePush()).toBe(PushStatus.ON);
    expect(await getPushStatus()).toBe(PushStatus.ON);
    expect(await disablePush()).toBe(PushStatus.OFF);
    await syncPushRegistration();
    expect(mocks.requestPermission).not.toHaveBeenCalled();
    expect(mocks.getToken).not.toHaveBeenCalled();
  });
});
