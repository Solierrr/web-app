import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import type { SaaSNavigationGroup } from "@/features/saas/saas";

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
    if (getRecentPages(context)[0] === key) return;
    localStorage.setItem(storageKey(context), JSON.stringify([key, ...getRecentPages(context).filter((item) => item !== key)].slice(0, 6)));
    window.dispatchEvent(new Event("solaria:recentPages"));
  } catch {
    return;
  }
}

export function filterPages(
  groups: SaaSNavigationGroup[],
  query: string,
  language: string,
  translate: (key: string) => string,
): SaaSNavigationGroup[] {
  const normalized = query.trim().toLocaleLowerCase(language);
  return groups.map((group) => ({
    ...group,
    items: group.items.filter((item) => translate(item.label).toLocaleLowerCase(language).includes(normalized)),
  }));
}
