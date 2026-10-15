import logger from "@/config/logging/logger";

const STORAGE_KEY = "solaria.login.remembered";

export interface RememberedLogin {
  email: string;
  method: "password" | "google" | "microsoft";
}

export function getRememberedLogin(): RememberedLogin | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved: unknown = JSON.parse(raw);
    if (!saved || typeof saved !== "object" || !("email" in saved) || !("method" in saved)) return null;
    if (
      typeof saved.email !== "string" ||
      !saved.email.includes("@") ||
      (saved.method !== "password" && saved.method !== "google" && saved.method !== "microsoft")
    )
      return null;
    return { email: saved.email, method: saved.method };
  } catch (error) {
    logger.warn("Could not read remembered login", error);
    return null;
  }
}

export function saveRememberedLogin(account: RememberedLogin | null): void {
  try {
    if (account) localStorage.setItem(STORAGE_KEY, JSON.stringify({ email: account.email, method: account.method }));
    else localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    logger.warn("Could not save remembered login", error);
  }
}
