import type { Professional } from "./professional";

import { professionalMocks } from "@/config/mocks/registry";
import { resolveWithMocks } from "@/config/mocks/fallback.service";
import { httpJson } from "@/shared/http/http.service";

const API = import.meta.env.VITE_API_PERSISTENCE;
const SERVICE_NAME = "professional";

export function getProfessional(id: string): Promise<Professional> {
  return resolveWithMocks(
    () =>
      httpJson<Professional>(`${API}/professionals/${id}`, {
        service: SERVICE_NAME,
        operation: "getProfessional",
        errorMessage: `Não foi possível obter o profissional ${id}`,
      }),
    () => professionalMocks.find((professional) => professional.id === id) ?? professionalMocks[0],
  );
}

// `slug` ainda não existe em `technician`/`person` no schema-api-core.sql
// (ver NOTE em `professional.d.ts`) — usado pela rota amigável de perfil
// (/profissional/{slug}).
export function getProfessionalBySlug(slug: string): Promise<Professional> {
  return resolveWithMocks(
    () =>
      httpJson<Professional>(`${API}/professionals/slug/${slug}`, {
        service: SERVICE_NAME,
        operation: "getProfessionalBySlug",
        errorMessage: `Não foi possível obter o profissional ${slug}`,
      }),
    () => professionalMocks.find((professional) => professional.slug === slug) ?? professionalMocks[0],
  );
}

export function getProfessionals(ids: string[]): Promise<Professional[]> {
  return resolveWithMocks(
    () =>
      httpJson<Professional[]>(`${API}/professionals?ids=${ids.join(",")}`, {
        service: SERVICE_NAME,
        operation: "getProfessionals",
        errorMessage: "Não foi possível obter os profissionais",
      }),
    () => professionalMocks,
  );
}
