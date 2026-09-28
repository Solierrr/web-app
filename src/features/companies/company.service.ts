import type { Company } from "./company";
import { CompanyStatus } from "./company.enum";

import { companyMocks } from "@/config/mocks/registry";
import { resolveWithMocks } from "@/config/mocks/fallback.service";
import { httpJson } from "@/shared/http/http.service";
import { API_CORE_URL } from "@/shared/http/apiCore.utils";
import { setMockOperationalContext } from "@/features/saas/saas.service";
import type { CompanyType } from "@/features/saas/saas";

const SERVICE_NAME = "company";

export interface CreateCompanyInput {
  type: CompanyType;
  cnpj: string;
  tradeName: string;
  corporateName: string;
}

export function createCompany(input: CreateCompanyInput): Promise<Company> {
  return resolveWithMocks(
    () =>
      httpJson<Company>(`${API_CORE_URL}/companies`, {
        service: SERVICE_NAME,
        operation: "createCompany",
        method: "POST",
        body: input,
        errorMessage: "Não foi possível cadastrar a empresa",
      }),
    () => {
      const company: Company = {
        id: `mock-company-${crypto.randomUUID()}`,
        status: CompanyStatus.UNDERANALYSIS,
        type: input.type,
        cnpj: input.cnpj,
        tradeName: input.tradeName,
        corporateName: input.corporateName,
        slug: input.tradeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      };
      setMockOperationalContext(input.type, company.id);
      return company;
    },
  );
}

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

export function getCompanies(ids?: string[]): Promise<Company[]> {
  return resolveWithMocks(
    () =>
      httpJson<Company[]>(`${API_CORE_URL}/companies`, {
        service: SERVICE_NAME,
        operation: "getCompanies",
        errorMessage: "Não foi possível obter as empresas",
      }).then((companies) => (ids ? companies.filter((company) => ids.includes(company.id)) : companies)),
    () => (ids ? companyMocks.filter((company) => ids.includes(company.id)) : companyMocks),
  );
}
