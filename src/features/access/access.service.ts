import type { AuthSession, LoginCredentials, RegisterCredentials, RegisterResult } from "./access";

import { httpJson } from "@/shared/http/http.service";
import { clearAuthSession, getAuthSession, setAuthSession } from "@/shared/auth/authToken.utils";

const API = `${import.meta.env.VITE_API_AUTH}/auth`;
const SERVICE_NAME = "access";

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
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

export function register(credentials: RegisterCredentials): Promise<RegisterResult> {
  return httpJson<RegisterResult>(`${API}/register`, {
    service: SERVICE_NAME,
    operation: "register",
    method: "POST",
    body: credentials,
    authenticated: false,
    errorMessage: "Não foi possível concluir o cadastro",
  });
}

let pendingRefresh: Promise<AuthSession | null> | null = null;

export function refresh(): Promise<AuthSession | null> {
  if (pendingRefresh) return pendingRefresh;
  const currentSession = getAuthSession();
  if (!currentSession) return Promise.resolve(null);

  const renew = async () => {
    const latest = getAuthSession();
    if (!latest || latest.refreshToken !== currentSession.refreshToken) return latest;
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
  await httpJson<void>(`${API}/logout`, {
    service: SERVICE_NAME,
    operation: "logout",
    method: "POST",
    errorMessage: "Não foi possível encerrar a sessão",
  });
  clearAuthSession();
}
