import type { IconName } from "@@/ui/icon/Icon";
export function groupByProjectDay<T>(items: T[], timestamp: (item: T) => string, descending = false) {
  const groups = new Map<string, { timestamp: string; items: T[] }>();
  const sorted = [...items].sort((a, b) => (new Date(timestamp(a)).getTime() - new Date(timestamp(b)).getTime()) * (descending ? -1 : 1));
  for (const item of sorted) {
    const value = timestamp(item),
      day = new Date(value);
    const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
    const group = groups.get(key) ?? { timestamp: value, items: [] };
    group.items.push(item);
    groups.set(key, group);
  }
  return [...groups.values()];
}
export function historyCategory(action: string): { key: string; icon: IconName } {
  if (action === "CREATED") return { key: "created", icon: "plus" };
  if (action === "ARCHIVED") return { key: "archived", icon: "archive" };
  if (action.startsWith("PHOTO") || action.startsWith("COVER")) return { key: "photos", icon: "image" };
  if (action.startsWith("ACTIVITY")) return { key: "activity", icon: "clock" };
  if (action.startsWith("MEMBER") || action.startsWith("INVITE") || ["INVITED", "ACCEPTED", "DECLINED", "REVOKED"].includes(action))
    return { key: "people", icon: "users" };
  if (action === "STATUS") return { key: "status", icon: "check" };
  return { key: "updated", icon: "edit" };
}
