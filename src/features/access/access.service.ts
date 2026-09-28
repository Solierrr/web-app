import type { AuthSession, LoginCredentials, RegisterCredentials, RegisterResult } from "./access";

import { resolveWithMocks } from "@/config/mocks/fallback.service";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import { httpJson } from "@/shared/http/http.service";
import { clearAuthSession, getAuthSession, setAuthSession } from "@/shared/auth/authToken.utils";

const API = `${import.meta.env.VITE_API_AUTH}/auth`;
const SERVICE_NAME = "access";

function createMockSession(email: string): AuthSession {
  return {
    accessToken: `mock-access-${crypto.randomUUID()}`,
    refreshToken: `mock-refresh-${crypto.randomUUID()}`,
    accessTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    userId: `mock-user-${crypto.randomUUID()}`,
    email,
    isMock: true,
  };
}

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const session = await resolveWithMocks(
    () =>
      httpJson<AuthSession>(`${API}/login`, {
        service: SERVICE_NAME,
        operation: "login",
        method: "POST",
        body: credentials,
        errorMessage: "Não foi possível fazer login",
      }),
    () => createMockSession(credentials.email),
  );
  setAuthSession(session);
  return session;
}

export async function loginWithMockProvider(provider: "google" | "microsoft"): Promise<AuthSession> {
  if (!isAlwaysMockMode()) throw new Error("Mock provider login is only available in mock mode");

  await waitForMockService();
  const session = createMockSession(`mock.${provider}@solaria.local`);
  setAuthSession(session);
  return session;
}

export function register(credentials: RegisterCredentials): Promise<RegisterResult> {
  return resolveWithMocks(
    () =>
      httpJson<RegisterResult>(`${API}/register`, {
        service: SERVICE_NAME,
        operation: "register",
        method: "POST",
        body: credentials,
        errorMessage: "Não foi possível concluir o cadastro",
      }),
    () => ({ id: `mock-user-${crypto.randomUUID()}`, email: credentials.email, message: "Account created" }),
  );
}

export async function refresh(): Promise<AuthSession | null> {
  const currentSession = getAuthSession();
  if (!currentSession) return null;

  const session = await resolveWithMocks(
    () =>
      httpJson<AuthSession>(`${API}/refresh`, {
        service: SERVICE_NAME,
        operation: "refresh",
        method: "POST",
        body: { refreshToken: currentSession.refreshToken },
        errorMessage: "Não foi possível renovar a sessão",
      }),
    () => ({ ...currentSession, accessTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() }),
  );
  setAuthSession(session);
  return session;
}

export async function logout(): Promise<void> {
  try {
    await resolveWithMocks(
      () =>
        httpJson<void>(`${API}/logout`, {
          service: SERVICE_NAME,
          operation: "logout",
          method: "POST",
          errorMessage: "Não foi possível encerrar a sessão",
        }),
      () => undefined,
    );
  } finally {
    clearAuthSession();
  }
}

export async function requestPasswordReset(): Promise<void> {
  if (!isAlwaysMockMode()) throw new Error("Password recovery is only available in mock mode");

  await waitForMockService();
}
