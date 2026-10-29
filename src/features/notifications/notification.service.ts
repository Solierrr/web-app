import i18n from "@/config/i18n/internationalization";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import { HttpResponseError, httpJson } from "@/lib/shared/http/http.service";
import type { DeviceRegistration, DeviceRegistrationRequest, NotificationItem, NotificationPage, NotificationQuery } from "./notification";
import { countMockUnread, listMockNotifications, markAllMockRead, markMockRead } from "./notification.d.mocks";
import { emitNotificationsChanged, isInstallationId } from "./notification.utils";

const SERVICE = "notify";

function api(): string {
  return `${import.meta.env.VITE_API_NOTIFY?.replace(/\/$/, "")}/notify`;
}

export function isNotificationNotFound(error: unknown): boolean {
  return error instanceof Error && error.cause instanceof HttpResponseError && error.cause.status === 404;
}

export async function listNotifications({ page = 0, size = 20, unreadOnly = false }: NotificationQuery = {}): Promise<NotificationPage> {
  if (isAlwaysMockMode("NOTIFY")) {
    await waitForMockService();
    return listMockNotifications({ page, size, unreadOnly });
  }
  return httpJson<NotificationPage>(`${api()}/notifications?page=${page}&size=${size}&unreadOnly=${unreadOnly}`, {
    service: SERVICE,
    operation: "listNotifications",
    errorMessage: i18n.t("services:notifications.list"),
  });
}

export async function getUnreadCount(): Promise<number> {
  if (isAlwaysMockMode("NOTIFY")) {
    await waitForMockService();
    return countMockUnread();
  }
  const response = await httpJson<{ count: number }>(`${api()}/notifications/unread-count`, {
    service: SERVICE,
    operation: "getUnreadCount",
    errorMessage: i18n.t("services:notifications.unreadCount"),
  });
  return response.count;
}

export async function markNotificationRead(id: string): Promise<NotificationItem> {
  if (isAlwaysMockMode("NOTIFY")) {
    await waitForMockService();
    const item = markMockRead(id);
    if (!item) throw new Error(i18n.t("services:notifications.markRead"));
    return item;
  }
  const item = await httpJson<NotificationItem>(`${api()}/notifications/${encodeURIComponent(id)}/read`, {
    service: SERVICE,
    operation: "markNotificationRead",
    method: "PATCH",
    errorMessage: i18n.t("services:notifications.markRead"),
  });
  emitNotificationsChanged();
  return item;
}

export async function markAllNotificationsRead(): Promise<void> {
  if (isAlwaysMockMode("NOTIFY")) {
    await waitForMockService();
    markAllMockRead();
    return;
  }
  await httpJson<void>(`${api()}/notifications/read-all`, {
    service: SERVICE,
    operation: "markAllNotificationsRead",
    method: "PATCH",
    errorMessage: i18n.t("services:notifications.markAllRead"),
  });
  emitNotificationsChanged();
}

export async function registerDevice(installationId: string, body: DeviceRegistrationRequest): Promise<DeviceRegistration> {
  if (!isInstallationId(installationId)) throw new Error(i18n.t("services:notifications.registerDevice"));
  if (isAlwaysMockMode("NOTIFY")) {
    await waitForMockService();
    return { installationId, platform: body.platform, appVersion: body.appVersion, updatedAt: new Date().toISOString() };
  }
  return httpJson<DeviceRegistration>(`${api()}/devices/${installationId}`, {
    service: SERVICE,
    operation: "registerDevice",
    method: "PUT",
    body,
    errorMessage: i18n.t("services:notifications.registerDevice"),
  });
}

export async function removeDevice(installationId: string): Promise<void> {
  if (!isInstallationId(installationId)) throw new Error(i18n.t("services:notifications.removeDevice"));
  if (isAlwaysMockMode("NOTIFY")) {
    await waitForMockService();
    return;
  }
  await httpJson<void>(`${api()}/devices/${installationId}`, {
    service: SERVICE,
    operation: "removeDevice",
    method: "DELETE",
    errorMessage: i18n.t("services:notifications.removeDevice"),
  });
}
