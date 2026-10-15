import { getAuthSession } from "@/lib/shared/auth/authToken.utils";

export interface MobileTransaction {
  transactionId: string;
  clientId: string;
  expiresAt: string;
  email: string;
  emailVerified: boolean;
  eligible: boolean;
  reasons: string[];
}

export class MobileFlowError extends Error {
  constructor(public readonly code: string) { super(code); }
}

async function request<T>(transactionId: string, action = "", method = "GET", body?: unknown): Promise<T> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(transactionId)) throw new MobileFlowError("INVALID_TRANSACTION");
  const session = getAuthSession();
  if (!session || session.isMock) throw new MobileFlowError("WEB_SESSION_REQUIRED");
  const response = await fetch(`${import.meta.env.VITE_API_AUTH}/auth/mobile/transactions/${transactionId}${action}`, {
    method, cache: "no-store", referrerPolicy: "no-referrer",
    headers: { Authorization: `Bearer ${session.accessToken}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new MobileFlowError(typeof result.code === "string" ? result.code : "UNAVAILABLE");
  }
  return response.status === 204 ? undefined as T : response.json();
}

export const inspectMobile = (id: string) => request<MobileTransaction>(id);
export const authorizeMobile = (id: string) => request<{ callbackUrl: string }>(id, "/authorize", "POST", { confirmed: true });
export const cancelMobile = (id: string) => request<void>(id, "", "DELETE");
