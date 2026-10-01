import type { Company } from "./company";

import { companyMocks } from "@/config/mocks/registry";
import { resolveWithMocks } from "@/config/mocks/fallback.service";
import { httpJson } from "@/shared/http/http.service";
import { API_CORE_URL } from "@/shared/http/apiCore.utils";
import { getMyUser } from "@/features/users/user/user.service";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import { getMockCompanyReviews, decideMockCompany } from "./company.d.mocks";
import { getOperationalAccount } from "@/features/access/access.onboarding.service";
import { CompanyStatus } from "./company.enum";

const SERVICE_NAME = "company";

export interface CatalogCompany {
  id: string;
  tradeName: string;
  slug: string;
  city: string | null;
  state: string | null;
  logoUrl?: string;
}

export function createCompany(payload: { type: "SUPPLIER" | "DEMANDANT"; cnpj: string; tradeName: string; corporateName: string }): Promise<Company> {
  return httpJson<Company>(`${API_CORE_URL}/companies`, {
    service: SERVICE_NAME,
    operation: "createCompany",
    method: "POST",
    body: payload,
    errorMessage: "Não foi possível cadastrar a empresa",
  });
}

interface AddressPayload {
  state: string;
  city: string;
  neighborhood?: string;
  zipCode: string;
  street: string;
  number?: string;
}

interface BusinessContactPayload {
  companyEmail: string;
  phone?: string;
  website?: string;
}

export function createAddress(payload: AddressPayload): Promise<{ id: string }> {
  return httpJson<{ id: string }>(`${API_CORE_URL}/addresses`, {
    service: SERVICE_NAME,
    operation: "createAddress",
    method: "POST",
    body: payload,
    errorMessage: "Não foi possível cadastrar o endereço",
  });
}

export function createBusinessContact(payload: BusinessContactPayload): Promise<{ id: string }> {
  return httpJson<{ id: string }>(`${API_CORE_URL}/business-contacts`, {
    service: SERVICE_NAME,
    operation: "createBusinessContact",
    method: "POST",
    body: payload,
    errorMessage: "Não foi possível cadastrar o contato comercial",
  });
}

export function attachCompanyAddress(companyId: string, addressId: string): Promise<Company> {
  return httpJson<Company>(`${API_CORE_URL}/companies/${encodeURIComponent(companyId)}/address`, {
    service: SERVICE_NAME,
    operation: "attachCompanyAddress",
    method: "PATCH",
    body: { addressId },
    errorMessage: "Não foi possível vincular o endereço à empresa",
  });
}

export function attachCompanyBusinessContact(companyId: string, businessContactId: string): Promise<Company> {
  return httpJson<Company>(`${API_CORE_URL}/companies/${encodeURIComponent(companyId)}/business-contact`, {
    service: SERVICE_NAME,
    operation: "attachCompanyBusinessContact",
    method: "PATCH",
    body: { businessContactId },
    errorMessage: "Não foi possível vincular o contato comercial à empresa",
  });
}

function mockCatalogCompany(company: Company): CatalogCompany {
  return {
    id: company.id,
    tradeName: company.tradeName,
    slug: company.slug,
    city: company.address?.city ?? null,
    state: company.address?.state ?? null,
    logoUrl: company.logoUrl,
  };
}

export function getCatalogCompanies(): Promise<CatalogCompany[]> {
  return resolveWithMocks(
    () =>
      httpJson<CatalogCompany[]>(`${API_CORE_URL}/catalog/companies`, {
        service: SERVICE_NAME,
        operation: "getCatalogCompanies",
        authenticated: false,
        errorMessage: "Não foi possível carregar os fornecedores",
      }),
    () => companyMocks.filter((company) => company.status === "APPROVED").map(mockCatalogCompany),
  );
}

export function getCatalogCompanyBySlug(slug: string): Promise<CatalogCompany> {
  return resolveWithMocks(
    () =>
      httpJson<CatalogCompany>(`${API_CORE_URL}/catalog/companies/${encodeURIComponent(slug)}`, {
        service: SERVICE_NAME,
        operation: "getCatalogCompanyBySlug",
        authenticated: false,
        errorMessage: "Não foi possível carregar o fornecedor",
      }),
    () => {
      const company = companyMocks.find((item) => item.slug === slug && item.status === "APPROVED");
      if (!company) throw new Error(`Fornecedor não encontrado: ${slug}`);
      return mockCatalogCompany(company);
    },
  );
}

export interface MyMembership {
  companyId: string;
  position: { id: string; name: string };
  permissions?: string[];
}

export async function getMyMembership(): Promise<MyMembership | null> {
  if (isAlwaysMockMode()) {
    const account = getOperationalAccount();
    const membership = account.memberships.find((item) => item.id === account.selectedContext) ?? account.memberships[0];
    return membership ? { companyId: membership.id, position: { id: "mock-position", name: membership.admin ? "ADMIN" : "MEMBER" } } : null;
  }
  await getMyUser();
  const membership = await httpJson<MyMembership | undefined>(`${API_CORE_URL}/user-companies/me`, {
    service: SERVICE_NAME,
    operation: "getMyCompanyMembership",
    errorMessage: "Não foi possível carregar o vínculo com a empresa",
  });
  return membership ?? null;
}

export async function getMyCompany(): Promise<Company | null> {
  if (isAlwaysMockMode()) {
    const account = getOperationalAccount();
    const membership = account.memberships.find((item) => item.id === account.selectedContext) ?? account.memberships[0];
    return membership
      ? {
          id: membership.id,
          type: membership.type,
          status: CompanyStatus.APPROVED,
          cnpj: "",
          tradeName: membership.name,
          corporateName: membership.name,
          slug: membership.id,
        }
      : null;
  }
  const membership = await getMyMembership();
  if (!membership) return null;
  return httpJson<Company>(`${API_CORE_URL}/companies/${encodeURIComponent(membership.companyId)}`, {
    service: SERVICE_NAME,
    operation: "getMyCompany",
    errorMessage: "Não foi possível carregar sua empresa",
  });
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

// Admin Solaria: aprovação/rejeição de empresas fica restrita ao platform admin
// no backend (ver RbacAuthorizationService.PLATFORM_ADMIN_ONLY_ENDPOINTS).
export async function approveCompany(id: string): Promise<Company> {
  if (isAlwaysMockMode()) { await waitForMockService(); return decideMockCompany(id, CompanyStatus.APPROVED); }
  return httpJson<Company>(`${API_CORE_URL}/companies/${encodeURIComponent(id)}/approval`, {
    service: SERVICE_NAME,
    operation: "approveCompany",
    method: "PATCH",
    errorMessage: `Não foi possível aprovar a empresa ${id}`,
  });
}

export async function rejectCompany(id: string): Promise<Company> {
  if (isAlwaysMockMode()) { await waitForMockService(); return decideMockCompany(id, CompanyStatus.REJECTED); }
  return httpJson<Company>(`${API_CORE_URL}/companies/${encodeURIComponent(id)}/rejection`, {
    service: SERVICE_NAME,
    operation: "rejectCompany",
    method: "PATCH",
    errorMessage: `Não foi possível rejeitar a empresa ${id}`,
  });
}

export async function listAllCompanies(): Promise<Company[]> {
  if (isAlwaysMockMode()) { await waitForMockService(); return getMockCompanyReviews(); }
  return httpJson<Company[]>(`${API_CORE_URL}/companies`, {
    service: SERVICE_NAME,
    operation: "listAllCompanies",
    errorMessage: "Não foi possível obter as empresas",
  });
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
