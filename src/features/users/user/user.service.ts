import type { User } from "./user";

import { userMocks } from "@/config/mocks/registry";
import { resolveWithMocks } from "@/config/mocks/fallback.service";
import { httpJson } from "@/shared/http/http.service";

const API = import.meta.env.VITE_API_PERSISTENCE;
const SERVICE_NAME = "user";

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
