import i18n from "@/config/i18n/internationalization";
import type { AuthSession, LoginCredentials, RegisterCredentials, RegisterResult } from "./access";

import { httpJson } from "@/lib/shared/http/http.service";
import { clearAuthSession, getAuthSession, setAuthSession } from "@/lib/shared/auth/authToken.utils";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import { createMockSession, createMockTestAccount, MOCK_TEST_EMAIL, MOCK_TEST_USER_ID } from "./access.d.mocks";
import { getOperationalAccount, saveOperationalAccount, selectContext } from "./access.onboarding.service";

const API = `${import.meta.env.VITE_API_AUTH}/auth`;
const SERVICE_NAME = "access";

export async function loginWithMockMicrosoft(): Promise<AuthSession> {
  if (!isAlwaysMockMode("AUTH")) throw new Error("Mock login is unavailable");
  await waitForMockService();
  const session = createMockSession(MOCK_TEST_EMAIL, MOCK_TEST_USER_ID);
  setAuthSession(session);
  const defaults = createMockTestAccount();
  const account = getOperationalAccount();
  saveOperationalAccount({
    ...defaults,
    ...account,
    professional: true,
    professionalProfile: account.professionalProfile ?? defaults.professionalProfile,
    memberships: [
      ...defaults.memberships.map((membership) => ({ ...membership, ...account.memberships.find((item) => item.id === membership.id), admin: true })),
      ...account.memberships.filter((membership) => !defaults.memberships.some((item) => item.id === membership.id)),
    ],
  });
  if (!account.selectedContext) selectContext(defaults.selectedContext!);
  const usernameKey = `solaria.mock.username.${session.userId}`;
  if (!localStorage.getItem(usernameKey)) localStorage.setItem(usernameKey, "Teste Solaria");
  return session;
}

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  if (isAlwaysMockMode("AUTH")) {
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
    errorMessage: i18n.t("services:access.login"),
  });
  setAuthSession(session);
  return session;
}

export async function register(credentials: RegisterCredentials): Promise<RegisterResult> {
  if (isAlwaysMockMode("AUTH")) {
    await waitForMockService();
    const session = createMockSession(credentials.email);
    return { id: session.userId, email: session.email, message: i18n.t("services:access.registrationSuccess") };
  }
  return httpJson<RegisterResult>(`${API}/register`, {
    service: SERVICE_NAME,
    operation: "register",
    method: "POST",
    body: credentials,
    authenticated: false,
    errorMessage: i18n.t("services:access.register"),
  });
}

export async function loginWithFirebase(idToken: string): Promise<AuthSession> {
  const session = await httpJson<AuthSession>(`${API}/firebase`, {
    service: SERVICE_NAME,
    operation: "loginWithFirebase",
    method: "POST",
    body: { idToken },
    authenticated: false,
    errorMessage: i18n.t("services:access.loginWithFirebase"),
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
    errorMessage: i18n.t("services:access.linkFirebase"),
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
    if (isAlwaysMockMode("AUTH") && latest.isMock) {
      const renewed = createMockSession(latest.email, latest.userId);
      renewed.managedByCompany = latest.managedByCompany;
      setAuthSession(renewed);
      return renewed;
    }
    const session = await httpJson<AuthSession>(`${API}/refresh`, {
      service: SERVICE_NAME,
      operation: "refresh",
      method: "POST",
      body: { refreshToken: latest.refreshToken },
      authenticated: false,
      errorMessage: i18n.t("services:access.refresh"),
    });
    // A resposta de uma renovação anterior não deve desfazer logout ou outro login.
    if (getAuthSession()?.refreshToken !== latest.refreshToken) return getAuthSession();
    setAuthSession(session);
    return session;
  };
  // O token é rotativo; serializar também entre abas evita revogar a sessão por reuso.
  pendingRefresh = (navigator.locks ? navigator.locks.request("solaria.auth.refresh", renew) : renew()).finally(() => {
    pendingRefresh = null;
  });
  return pendingRefresh;
}

export async function logout(): Promise<void> {
  if (isAlwaysMockMode("AUTH") && getAuthSession()?.isMock) {
    clearAuthSession();
    return;
  }
  await httpJson<void>(`${API}/sessions/current/logout`, {
    service: SERVICE_NAME,
    operation: "logout",
    method: "POST",
    errorMessage: i18n.t("services:access.logout"),
  });
  clearAuthSession();
}
