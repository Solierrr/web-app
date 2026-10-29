import type { NotificationType } from "./notification.enum";

export interface NotificationItem {
  id: string;
  type: NotificationType | string;
  title: string;
  body: string;
  data: Record<string, string>;
  createdAt: string;
  readAt: string | null;
}

export interface NotificationPage {
  content: NotificationItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface NotificationQuery {
  page?: number;
  size?: number;
  unreadOnly?: boolean;
}

export interface DeviceRegistrationRequest {
  fcmToken: string;
  platform: "WEB";
  appVersion: string;
}

export interface DeviceRegistration {
  installationId: string;
  platform: string;
  appVersion: string;
  updatedAt: string;
}

export interface PushNavigationTarget {
  type: string;
  data: Record<string, string>;
}
