import type { User } from "./user";

import { userMocks } from "@/config/mocks/registry";
import { resolveWithMocks } from "@/config/mocks/fallback.service";
import { httpJson } from "@/shared/http/http.service";

const API = import.meta.env.VITE_API_CORE;
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
  return httpJson<MyUser>(`${import.meta.env.VITE_API_CORE}/api/users/me`, {
    service: SERVICE_NAME,
    operation: "getMyUser",
    errorMessage: "Não foi possível carregar seu perfil",
  });
}

export function updateMyUser(username: string): Promise<MyUser> {
  return httpJson<MyUser>(`${import.meta.env.VITE_API_CORE}/api/users/me`, {
    service: SERVICE_NAME,
    operation: "updateMyUser",
    method: "PATCH",
    body: { username },
    errorMessage: "Não foi possível salvar seu perfil",
  });
}

export function getUser(id: string): Promise<User> {
  return resolveWithMocks(
    () =>
      httpJson<User>(`${API}/users/${id}`, {
        service: SERVICE_NAME,
        operation: "getUser",
        errorMessage: `Não foi possível obter o usuário ${id}`,
      }),
    () => userMocks.find((user) => user.id === id) ?? userMocks[0],
  );
}

export function getUsers(ids: string[]): Promise<User[]> {
  return resolveWithMocks(
    () =>
      httpJson<User[]>(`${API}/users?ids=${ids.join(",")}`, {
        service: SERVICE_NAME,
        operation: "getUsers",
        errorMessage: "Não foi possível obter os usuários",
      }),
    () => userMocks,
  );
}
