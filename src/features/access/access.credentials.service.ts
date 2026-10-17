import { httpJson } from "@/lib/shared/http/http.service";

const API = `${import.meta.env.VITE_API_AUTH}/auth`;

export interface AccountIdentity {
  userId: string;
  email: string;
  emailVerified: boolean;
  sessionId: string;
  clientId: string;
  context: string;
}

function request<T>(path: string, body?: unknown, authenticated = true): Promise<T> {
  return httpJson<T>(`${API}${path}`, { service: "access", operation: path.split("/").filter(Boolean).join("."),
    errorMessage: "Authentication request failed", method: body === undefined ? "GET" : "POST", body, authenticated });
}

export const getAccountIdentity = () => request<AccountIdentity>("/me");
export const requestEmailVerification = () => request<void>("/email/verification/request", {});
export const confirmEmailVerification = (token: string) => request<void>("/email/verification/confirm", { token }, false);
export const requestPasswordReset = (email: string) => request<void>("/password/reset/request", { email }, false);
export const completePasswordReset = (token: string, password: string) => request<void>("/password/reset/confirm", { token, password }, false);
export const changePassword = (currentPassword: string, password: string) => request<void>("/password/change", { currentPassword, password });
export const migratePassword = (idToken: string, password: string) => request<void>("/password/migrate", { idToken, password });
