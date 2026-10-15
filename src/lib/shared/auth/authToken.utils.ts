import type { AuthSession } from "@/features/access/access";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";

const STORAGE_KEY = "solaria.authSession";

export function getAuthSession(): AuthSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as AuthSession;
    // A session issued by the retired local login cannot authenticate API calls.
    if (session.isMock && !isAlwaysMockMode("AUTH")) return null;
    return session;
  } catch {
    return null;
  }
}

export function setAuthSession(session: AuthSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("solaria:session"));
}

export function clearAuthSession(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("solaria:session"));
}
