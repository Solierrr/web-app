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
}

export async function getMyUser(): Promise<MyUser> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return createMockUser();
  }
  return httpJson<MyUser>(`${API_CORE_URL}/users/me`, {
    service: SERVICE_NAME,
    operation: "getMyUser",
    errorMessage: "Não foi possível carregar seu perfil",
  });
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
    errorMessage: "Não foi possível salvar seu perfil",
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
    errorMessage: `Não foi possível obter o usuário ${id}`,
  });
}
