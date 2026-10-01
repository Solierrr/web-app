import { getAuthSession } from "@/lib/shared/auth/authToken.utils";

function storageKey(context: string): string {
  return `solaria.recentPages.${getAuthSession()?.userId ?? "anonymous"}.${context}`;
}

export function getRecentPages(context: string): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey(context)) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").slice(0, 6) : [];
  } catch {
    return [];
  }
}

export function rememberPage(context: string, key: string): void {
  try {
    localStorage.setItem(storageKey(context), JSON.stringify([key, ...getRecentPages(context).filter((item) => item !== key)].slice(0, 6)));
  } catch {
    return;
  }
}
