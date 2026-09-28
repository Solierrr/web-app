import type { Company } from "./company";

import { companyMocks } from "@/config/mocks/registry";
import { resolveWithMocks } from "@/config/mocks/fallback.service";
import { httpJson } from "@/shared/http/http.service";
import { API_CORE_URL } from "@/shared/http/apiCore.utils";

const SERVICE_NAME = "company";

export function getCompany(id: string): Promise<Company> {
  return resolveWithMocks(
    () =>
      httpJson<Company>(`${API_CORE_URL}/companies/${id}`, {
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
      httpJson<Company>(`${API_CORE_URL}/companies/slug/${slug}`, {
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
      httpJson<Company[]>(`${API_CORE_URL}/companies`, {
        service: SERVICE_NAME,
        operation: "getCompanies",
        errorMessage: "Não foi possível obter as empresas",
      }).then((companies) => companies.filter((company) => ids.includes(company.id))),
    () => companyMocks,
  );
}
