import type { AuthSession } from "@/features/access/access";
import { authSession } from "./authSession.service";

export function getAuthSession(): AuthSession | null {
  return authSession.get();
}

export function setAuthSession(session: AuthSession): void {
  authSession.set(session);
}

export function clearAuthSession(signedOut = false): void {
  authSession.clear(signedOut);
}
export const getAuthSessionVersion = () => authSession.version();
export const canRestoreAuthSession = () => authSession.canRestore();
