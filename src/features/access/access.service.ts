import i18n from "@/config/i18n/internationalization";
import type { AuthSession, LoginCredentials, RegisterCredentials, RegisterResult } from "./access";

import { httpJson } from "@/lib/shared/http/http.service";
import { canRestoreAuthSession, clearAuthSession, getAuthSession, getAuthSessionVersion, setAuthSession } from "@/lib/shared/auth/authToken.utils";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import { createMockSession, createMockTestAccount, MOCK_TEST_EMAIL, MOCK_TEST_USER_ID } from "./access.d.mocks";
import { getOperationalAccount, saveOperationalAccount, selectContext } from "./access.onboarding.service";

const API = `${import.meta.env.VITE_API_AUTH}/auth`;
const SERVICE_NAME = "access";
const BROWSER = `${API}/browser`;
const browserOptions = { credentials: "include" as const, redirect: "error" as const, headers: { "X-Solaria-Session": "1" } };
const browserJson = <T>(url: string, options: Parameters<typeof httpJson>[1]) => navigator.locks
  ? navigator.locks.request("solaria.browser.session", () => httpJson<T>(url, options))
  : httpJson<T>(url, options);
function commitSession(session: AuthSession, version: number) {
  if (getAuthSessionVersion() !== version) throw new Error(i18n.t("services:access.login"));
  setAuthSession(session);
  return session;
}

export async function loginWithMockMicrosoft(): Promise<AuthSession> {
  const version = getAuthSessionVersion();
  if (!isAlwaysMockMode("AUTH")) throw new Error("Mock login is unavailable");
  await waitForMockService();
  const session = createMockSession(MOCK_TEST_EMAIL, MOCK_TEST_USER_ID);
  commitSession(session, version);
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
  const version = getAuthSessionVersion();
  if (isAlwaysMockMode("AUTH")) {
    await waitForMockService();
    const session = createMockSession(credentials.email);
    commitSession(session, version);
    return session;
  }
  const session = await browserJson<AuthSession>(`${BROWSER}/login`, {
    ...browserOptions,
    service: SERVICE_NAME,
    operation: "login",
    method: "POST",
    body: credentials,
    authenticated: false,
    errorMessage: i18n.t("services:access.login"),
  });
  return commitSession(session, version);
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
  const version = getAuthSessionVersion();
  const session = await browserJson<AuthSession>(`${BROWSER}/firebase`, {
    ...browserOptions,
    service: SERVICE_NAME,
    operation: "loginWithFirebase",
    method: "POST",
    body: { idToken },
    authenticated: false,
    errorMessage: i18n.t("services:access.loginWithFirebase"),
  });
  return commitSession(session, version);
}

export async function linkFirebase(email: string, password: string, idToken: string): Promise<AuthSession> {
  const version = getAuthSessionVersion();
  const session = await browserJson<AuthSession>(`${BROWSER}/firebase/link`, {
    ...browserOptions,
    service: SERVICE_NAME,
    operation: "linkFirebase",
    method: "POST",
    body: { email, password, idToken },
    authenticated: false,
    errorMessage: i18n.t("services:access.linkFirebase"),
  });
  return commitSession(session, version);
}

let pendingRefresh: Promise<AuthSession | null> | null = null;

export function refresh(): Promise<AuthSession | null> {
  if (!canRestoreAuthSession() && !getAuthSession()) return Promise.resolve(null);
  if (pendingRefresh) return pendingRefresh;
  const version = getAuthSessionVersion();
  if (isAlwaysMockMode("AUTH") && !getAuthSession()) return Promise.resolve(null);

  const renew = async () => {
    const latest = getAuthSession();
    if (getAuthSessionVersion() !== version) return latest;
    if (isAlwaysMockMode("AUTH") && latest?.isMock) {
      const renewed = createMockSession(latest.email, latest.userId);
      renewed.managedByCompany = latest.managedByCompany;
      setAuthSession(renewed);
      return renewed;
    }
    const session = await browserJson<AuthSession | null>(`${BROWSER}/refresh`, {
      ...browserOptions,
      service: SERVICE_NAME,
      operation: "refresh",
      method: "POST",
      body: {},
      authenticated: false,
      errorMessage: i18n.t("services:access.refresh"),
    });
    // A resposta de uma renovação anterior não deve desfazer logout ou outro login.
    if (getAuthSessionVersion() !== version) return getAuthSession();
    if (session) setAuthSession(session);
    return session ?? null;
  };
  // O token é rotativo; serializar também entre abas evita revogar a sessão por reuso.
  pendingRefresh = (navigator.locks ? navigator.locks.request("solaria.auth.refresh", renew) : renew()).finally(() => {
    pendingRefresh = null;
  });
  return pendingRefresh;
}

export async function logout(): Promise<void> {
  if (isAlwaysMockMode("AUTH") && getAuthSession()?.isMock) {
    clearAuthSession(true);
    return;
  }
  clearAuthSession(true);
  await browserJson<void>(`${BROWSER}/logout`, {
    ...browserOptions,
    service: SERVICE_NAME,
    operation: "logout",
    method: "POST",
    body: {},
    authenticated: false,
    errorMessage: i18n.t("services:access.logout"),
  });
}
