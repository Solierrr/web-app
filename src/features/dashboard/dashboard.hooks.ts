import { useSyncExternalStore } from "react";
import { getRecentPages } from "./dashboard.utils";

function subscribe(listener: () => void) {
  window.addEventListener("solaria:recentPages", listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener("solaria:recentPages", listener);
    window.removeEventListener("storage", listener);
  };
}

export function useRecentPages(context: string): string[] {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(getRecentPages(context)),
    () => "[]",
  );
  return JSON.parse(snapshot) as string[];
}
