import type { Company } from "./company";

import { companyMocks } from "@/config/mocks/registry";
import { resolveWithMocks } from "@/config/mocks/fallback.service";

const API = import.meta.env.VITE_API_PERSISTENCE;

async function fetchJson<T>(path: string, errorMessage: string): Promise<T> {
  const response = await fetch(`${API}${path}`);

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

export function getCompany(id: string): Promise<Company> {
  return resolveWithMocks(
    () =>
      fetchJson<Company>(`/companies/${id}`, `Não foi possível obter a empresa ${id}`),
    () => companyMocks.find((company) => company.id === id) ?? companyMocks[0],
  );
}

// `slug` ainda não existe em `company` no schema-api-core.sql (ver NOTE em
// `company.d.ts`) — usado pelas rotas amigáveis de perfil (/empresa/{slug}).
export function getCompanyBySlug(slug: string): Promise<Company> {
  return resolveWithMocks(
    () =>
      fetchJson<Company>(
        `/companies/slug/${slug}`,
        `Não foi possível obter a empresa ${slug}`,
      ),
    () => companyMocks.find((company) => company.slug === slug) ?? companyMocks[0],
  );
}

export function getCompanies(ids: string[]): Promise<Company[]> {
  return resolveWithMocks(
    () =>
      fetchJson<Company[]>(`/companies?ids=${ids.join(",")}`, "Não foi possível obter as empresas"),
    () => companyMocks,
  );
}
