import type { User } from "./user";

import { userMocks } from "@/config/mocks/registry";
import { resolveWithMocks } from "@/config/mocks/fallback.service";

const API = import.meta.env.VITE_API_PERSISTENCE;

async function fetchJson<T>(path: string, errorMessage: string): Promise<T> {
  const response = await fetch(`${API}${path}`);

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

export function getUser(id: string): Promise<User> {
  return resolveWithMocks(
    () => fetchJson<User>(`/users/${id}`, `Não foi possível obter o usuário ${id}`),
    () => userMocks.find((user) => user.id === id) ?? userMocks[0],
  );
}

export function getUsers(ids: string[]): Promise<User[]> {
  return resolveWithMocks(
    () => fetchJson<User[]>(`/users?ids=${ids.join(",")}`, "Não foi possível obter os usuários"),
    () => userMocks,
  );
}
