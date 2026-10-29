import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import type { NotificationItem, NotificationPage, NotificationQuery } from "./notification";
import { NotificationType } from "./notification.enum";
import { emitNotificationsChanged } from "./notification.utils";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function key(): string {
  return `solaria.mock.notifications.${getAuthSession()?.userId ?? "anonymous"}`;
}

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function demoNotifications(): NotificationItem[] {
  return [
    {
      id: "00000000-0000-4000-8000-000000000001",
      type: NotificationType.NEW_MESSAGE,
      title: "Nova mensagem",
      body: "Comparar placas monocristalinas e policristalinas",
      data: { conversationId: "demo-0" },
      createdAt: minutesAgo(5),
      readAt: null,
    },
    {
      id: "00000000-0000-4000-8000-000000000002",
      type: NotificationType.SERVICE_SCHEDULED,
      title: "Serviço agendado",
      body: "A instalação foi agendada para a próxima semana.",
      data: {},
      createdAt: minutesAgo(90),
      readAt: null,
    },
    {
      id: "00000000-0000-4000-8000-000000000003",
      type: NotificationType.SERVICE_STATUS_CHANGED,
      title: "Status do serviço atualizado",
      body: "O serviço mudou para em andamento.",
      data: {},
      createdAt: minutesAgo(60 * 26),
      readAt: minutesAgo(60 * 20),
    },
  ];
}

function read(): NotificationItem[] {
  try {
    const stored = JSON.parse(localStorage.getItem(key()) ?? "null") as NotificationItem[] | null;
    if (Array.isArray(stored)) return stored;
  } catch {
    localStorage.removeItem(key());
  }
  const seeded = demoNotifications();
  localStorage.setItem(key(), JSON.stringify(seeded));
  return seeded;
}

function write(items: NotificationItem[]): void {
  localStorage.setItem(key(), JSON.stringify(items));
  emitNotificationsChanged();
}

export function listMockNotifications({ page = 0, size = DEFAULT_PAGE_SIZE, unreadOnly = false }: NotificationQuery = {}): NotificationPage {
  const limit = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
  const items = read()
    .filter((item) => !unreadOnly || item.readAt === null)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return {
    content: items.slice(page * limit, page * limit + limit),
    page,
    size: limit,
    totalElements: items.length,
    totalPages: Math.ceil(items.length / limit),
  };
}

export function countMockUnread(): number {
  return read().filter((item) => item.readAt === null).length;
}

export function markMockRead(id: string): NotificationItem | null {
  const items = read();
  const target = items.find((item) => item.id === id);
  if (!target) return null;
  const updated = { ...target, readAt: target.readAt ?? new Date().toISOString() };
  write(items.map((item) => (item.id === id ? updated : item)));
  return updated;
}

export function markAllMockRead(): void {
  const now = new Date().toISOString();
  write(read().map((item) => ({ ...item, readAt: item.readAt ?? now })));
}
