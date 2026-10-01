import type { AuthSession, LoginCredentials, RegisterCredentials, RegisterResult } from "./access";

import { httpJson } from "@/shared/http/http.service";
import { clearAuthSession, getAuthSession, setAuthSession } from "@/shared/auth/authToken.utils";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import { createMockSession } from "./access.d.mocks";

const API = `${import.meta.env.VITE_API_AUTH}/auth`;
const SERVICE_NAME = "access";

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    const session = createMockSession(credentials.email);
    setAuthSession(session);
    return session;
  }
  const session = await httpJson<AuthSession>(`${API}/login`, {
    service: SERVICE_NAME,
    operation: "login",
    method: "POST",
    body: credentials,
    authenticated: false,
    errorMessage: "Não foi possível fazer login",
  });
  setAuthSession(session);
  return session;
}

export async function register(credentials: RegisterCredentials): Promise<RegisterResult> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    const session = createMockSession(credentials.email);
    return { id: session.userId, email: session.email, message: "Cadastro realizado" };
  }
  return httpJson<RegisterResult>(`${API}/register`, {
    service: SERVICE_NAME,
    operation: "register",
    method: "POST",
    body: credentials,
    authenticated: false,
    errorMessage: "Não foi possível concluir o cadastro",
  });
}

export async function loginWithFirebase(idToken: string): Promise<AuthSession> {
  const session = await httpJson<AuthSession>(`${API}/firebase`, {
    service: SERVICE_NAME,
    operation: "loginWithFirebase",
    method: "POST",
    body: { idToken },
    authenticated: false,
    errorMessage: "Não foi possível fazer login",
  });
  setAuthSession(session);
  return session;
}

export async function linkFirebase(email: string, password: string, idToken: string): Promise<AuthSession> {
  const session = await httpJson<AuthSession>(`${API}/firebase/link`, {
    service: SERVICE_NAME,
    operation: "linkFirebase",
    method: "POST",
    body: { email, password, idToken },
    authenticated: false,
    errorMessage: "Não foi possível vincular sua conta ao Firebase",
  });
  setAuthSession(session);
  return session;
}

let pendingRefresh: Promise<AuthSession | null> | null = null;

export function refresh(): Promise<AuthSession | null> {
  if (pendingRefresh) return pendingRefresh;
  const currentSession = getAuthSession();
  if (!currentSession) return Promise.resolve(null);

  const renew = async () => {
    const latest = getAuthSession();
    if (!latest || latest.refreshToken !== currentSession.refreshToken) return latest;
    if (isAlwaysMockMode() && latest.isMock) {
      const renewed = createMockSession(latest.email, latest.userId);
      setAuthSession(renewed);
      return renewed;
    }
    const session = await httpJson<AuthSession>(`${API}/refresh`, {
      service: SERVICE_NAME,
      operation: "refresh",
      method: "POST",
      body: { refreshToken: latest.refreshToken },
      authenticated: false,
      errorMessage: "Não foi possível renovar a sessão",
    });
    // A resposta de uma renovação anterior não deve desfazer logout ou outro login.
    if (getAuthSession()?.refreshToken !== latest.refreshToken) return getAuthSession();
    setAuthSession(session);
    return session;
  };
  // O token é rotativo; serializar também entre abas evita revogar a sessão por reuso.
  pendingRefresh = (navigator.locks ? navigator.locks.request("solaria.auth.refresh", renew) : renew())
    .finally(() => { pendingRefresh = null; });
  return pendingRefresh;
}

export async function logout(): Promise<void> {
  if (isAlwaysMockMode() && getAuthSession()?.isMock) {
    clearAuthSession();
    return;
  }
  await httpJson<void>(`${API}/logout`, {
    service: SERVICE_NAME,
    operation: "logout",
    method: "POST",
    errorMessage: "Não foi possível encerrar a sessão",
  });
  clearAuthSession();
}
