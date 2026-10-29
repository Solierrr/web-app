import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import type { PushNavigationTarget } from "./notification";
import { NotificationType } from "./notification.enum";

export const NOTIFICATIONS_CHANGED_EVENT = "solaria:notifications";
export const PUSH_LAUNCH_PARAMETER = "push";

const INSTALLATION_ID = /^[A-Za-z0-9_-]{1,64}$/;
const IDENTIFIER = /^[A-Za-z0-9_-]{1,64}$/;
const MAX_VERSION_LENGTH = 32;

export function isInstallationId(value: unknown): value is string {
  return typeof value === "string" && INSTALLATION_ID.test(value);
}

export function emitNotificationsChanged(): void {
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

export function browserVersionLabel(userAgent: string): string {
  const candidates: [RegExp, string][] = [
    [/Edg(?:e|A|iOS)?\/(\d+)/, "Edge"],
    [/OPR\/(\d+)/, "Opera"],
    [/Firefox\/(\d+)/, "Firefox"],
    [/(?:Chrome|CriOS)\/(\d+)/, "Chrome"],
    [/Version\/(\d+).*Safari/, "Safari"],
  ];
  for (const [pattern, name] of candidates) {
    const match = pattern.exec(userAgent);
    if (match) return `${name} ${match[1]}`.slice(0, MAX_VERSION_LENGTH);
  }
  return "Web";
}

export function resolveNotificationRoute(target: PushNavigationTarget, lang: SupportedLanguage): string | null {
  if (target.type === NotificationType.NEW_MESSAGE) {
    const conversationId = target.data.conversationId;
    return IDENTIFIER.test(conversationId ?? "") ? routePaths.chat(lang, conversationId) : routePaths.inbox(lang);
  }
  return null;
}

export function parsePushLaunch(search: string): PushNavigationTarget | null {
  const raw = new URLSearchParams(search).get(PUSH_LAUNCH_PARAMETER);
  if (!raw || raw.length > 2000) return null;
  try {
    return normalizePushTarget(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function normalizePushTarget(value: unknown): PushNavigationTarget | null {
  if (typeof value !== "object" || value === null) return null;
  const { type, data } = value as { type?: unknown; data?: unknown };
  if (typeof type !== "string" || !Object.values<string>(NotificationType).includes(type)) return null;
  const safe: Record<string, string> = {};
  if (typeof data === "object" && data !== null) {
    for (const [key, item] of Object.entries(data)) if (typeof item === "string" && item.length <= 200) safe[key] = item;
  }
  return { type, data: safe };
}

export function stripPushLaunch(search: string): string {
  const params = new URLSearchParams(search);
  params.delete(PUSH_LAUNCH_PARAMETER);
  const rest = params.toString();
  return rest ? `?${rest}` : "";
}
