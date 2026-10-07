import i18n from "@/config/i18n/internationalization";
import { httpJson } from "@/lib/shared/http/http.service";
import { API_CORE_URL } from "@/lib/shared/http/apiCore.utils";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import { createMockUser } from "./user.d.mocks";

const SERVICE_NAME = "user";

export interface MyUser {
  id: string;
  authId: string;
  username: string;
  avatar: string | null;
  banner: string | null;
  active: boolean;
  managedByCompanyId?: string | null;
}

interface SelfProfile {
  id: string;
  authId: string;
  avatar: string | null;
  banner: string | null;
  managedByCompanyId?: string | null;
}

export async function getMyUser(): Promise<MyUser> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return createMockUser();
  }
  // O perfil próprio não traz o username (dado de exibição): ele vem do resumo público por authId.
  const profile = await httpJson<SelfProfile>(`${API_CORE_URL}/users/me`, {
    service: SERVICE_NAME,
    operation: "getMyUser",
    errorMessage: i18n.t("services:user.getMyUser"),
  });
  const summary = await httpJson<{ username: string; avatar: string | null }>(
    `${API_CORE_URL}/users/auth/${encodeURIComponent(profile.authId)}/summary`,
    {
      service: SERVICE_NAME,
      operation: "getMyUserSummary",
      errorMessage: i18n.t("services:user.getMyUser"),
    },
  );
  return {
    id: profile.id,
    authId: profile.authId,
    username: summary.username,
    avatar: profile.avatar ?? summary.avatar,
    banner: profile.banner,
    active: true,
    managedByCompanyId: profile.managedByCompanyId,
  };
}

export async function updateMyUser(username: string): Promise<MyUser> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    const user = createMockUser();
    localStorage.setItem(`solaria.mock.username.${user.id}`, username);
    return { ...user, username };
  }
  return httpJson<MyUser>(`${API_CORE_URL}/users/me`, {
    service: SERVICE_NAME,
    operation: "updateMyUser",
    method: "PATCH",
    body: { username },
    errorMessage: i18n.t("services:user.updateMyUser"),
  });
}

export async function getUser(id: string): Promise<MyUser> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return createMockUser(id);
  }
  return httpJson<MyUser>(`${API_CORE_URL}/users/${encodeURIComponent(id)}`, {
    service: SERVICE_NAME,
    operation: "getUser",
    errorMessage: i18n.t("services:user.getUser", { id }),
  });
}
