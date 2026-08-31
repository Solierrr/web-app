import type { Professional } from "./professional";

import { professionalMocks } from "@/config/mocks/registry";
import { resolveWithMocks } from "@/config/mocks/fallback.service";

const API = import.meta.env.VITE_API_PERSISTENCE;

async function fetchJson<T>(path: string, errorMessage: string): Promise<T> {
  const response = await fetch(`${API}${path}`);

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

export function getProfessional(id: string): Promise<Professional> {
  return resolveWithMocks(
    () =>
      fetchJson<Professional>(
        `/professionals/${id}`,
        `Não foi possível obter o profissional ${id}`,
      ),
    () => professionalMocks.find((professional) => professional.id === id) ?? professionalMocks[0],
  );
}

// `slug` ainda não existe em `technician`/`person` no schema-api-core.sql
// (ver NOTE em `professional.d.ts`) — usado pela rota amigável de perfil
// (/profissional/{slug}).
export function getProfessionalBySlug(slug: string): Promise<Professional> {
  return resolveWithMocks(
    () =>
      fetchJson<Professional>(
        `/professionals/slug/${slug}`,
        `Não foi possível obter o profissional ${slug}`,
      ),
    () => professionalMocks.find((professional) => professional.slug === slug) ?? professionalMocks[0],
  );
}

export function getProfessionals(ids: string[]): Promise<Professional[]> {
  return resolveWithMocks(
    () =>
      fetchJson<Professional[]>(
        `/professionals?ids=${ids.join(",")}`,
        "Não foi possível obter os profissionais",
      ),
    () => professionalMocks,
  );
}
