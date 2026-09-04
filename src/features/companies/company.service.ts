import type { Company } from "./company";

import { companyMocks } from "@/config/mocks/registry";
import { resolveWithMocks } from "@/config/mocks/fallback.service";
import { httpJson } from "@lib/shared/http/http.service";

const API = import.meta.env.VITE_API_PERSISTENCE;
const SERVICE_NAME = "company";

export function getCompany(id: string): Promise<Company> {
  return resolveWithMocks(
    () =>
      httpJson<Company>(`${API}/companies/${id}`, {
        service: SERVICE_NAME,
        operation: "getCompany",
        errorMessage: `Não foi possível obter a empresa ${id}`,
      }),
    () => companyMocks.find((company) => company.id === id) ?? companyMocks[0],
  );
}

export function getCompanyBySlug(slug: string): Promise<Company> {
  return resolveWithMocks(
    () =>
      httpJson<Company>(`${API}/companies/slug/${slug}`, {
        service: SERVICE_NAME,
        operation: "getCompanyBySlug",
        errorMessage: `Não foi possível obter a empresa ${slug}`,
      }),
    () => companyMocks.find((company) => company.slug === slug) ?? companyMocks[0],
  );
}

export function getCompanies(ids: string[]): Promise<Company[]> {
  return resolveWithMocks(
    () =>
      httpJson<Company[]>(`${API}/companies?ids=${ids.join(",")}`, {
        service: SERVICE_NAME,
        operation: "getCompanies",
        errorMessage: "Não foi possível obter as empresas",
      }),
    () => companyMocks,
  );
}
