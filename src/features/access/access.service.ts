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
    errorMessage: "Não foi possível concluir o cadastro",
  });
}

export async function refresh(): Promise<AuthSession | null> {
  const currentSession = getAuthSession();
  if (!currentSession) return null;

  const session = await httpJson<AuthSession>(`${API}/refresh`, {
    service: SERVICE_NAME,
    operation: "refresh",
    method: "POST",
    body: { refreshToken: currentSession.refreshToken },
    errorMessage: "Não foi possível renovar a sessão",
  });
  setAuthSession(session);
  return session;
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
