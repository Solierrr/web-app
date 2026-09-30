import { httpJson } from "@/shared/http/http.service";
import { API_CORE_URL } from "@/shared/http/apiCore.utils";

const SERVICE_NAME = "user";

export interface MyUser {
  id: string;
  authId: string;
  username: string;
  avatar: string | null;
  banner: string | null;
  active: boolean;
}

export function getMyUser(): Promise<MyUser> {
  return httpJson<MyUser>(`${API_CORE_URL}/users/me`, {
    service: SERVICE_NAME,
    operation: "getMyUser",
    errorMessage: "Não foi possível carregar seu perfil",
  });
}

export function updateMyUser(username: string): Promise<MyUser> {
  return httpJson<MyUser>(`${API_CORE_URL}/users/me`, {
    service: SERVICE_NAME,
    operation: "updateMyUser",
    method: "PATCH",
    body: { username },
    errorMessage: "Não foi possível salvar seu perfil",
  });
}

export function getUser(id: string): Promise<MyUser> {
  return httpJson<MyUser>(`${API_CORE_URL}/users/${encodeURIComponent(id)}`, {
    service: SERVICE_NAME,
    operation: "getUser",
    errorMessage: `Não foi possível obter o usuário ${id}`,
  });
}
