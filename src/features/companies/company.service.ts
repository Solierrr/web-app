import i18n from "@/config/i18n/internationalization";
import { createServiceError } from "@/config/logging/serviceError.utils";
import type { Company } from "./company";

import { companyMocks } from "@/config/mocks/registry";
import { resolveWithMocks } from "@/config/mocks/fallback.service";
import { httpJson } from "@/lib/shared/http/http.service";
import { API_CORE_URL } from "@/lib/shared/http/apiCore.utils";
import { getMyUser } from "@/features/users/user/user.service";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import { getMockCompanyReviews, decideMockCompany } from "./company.d.mocks";
import { getOperationalAccount, getSelectedContext, saveOperationalAccount } from "@/features/access/access.onboarding.service";
import { CompanyStatus, type CompanyActivity } from "./company.enum";

const SERVICE_NAME = "company";

export interface CatalogCompany {
  id: string;
  tradeName: string;
  slug: string;
  city: string | null;
  state: string | null;
  logoUrl?: string;
  bannerUrl?: string;
  activities?: CompanyActivity[];
  hasTechnicalTeam?: boolean;
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

export function createCompany(payload: {
  type: "SUPPLIER" | "DEMANDANT";
  cnpj: string;
  tradeName: string;
  corporateName: string;
  address?: AddressPayload;
  businessContact?: BusinessContactPayload;
}): Promise<Company> {
  return httpJson<Company>(`${API_CORE_URL}/companies`, {
    service: SERVICE_NAME,
    operation: "createCompany",
    method: "POST",
    body: payload,
    errorMessage: i18n.t("services:company.createCompany"),
  });
}

function mockCatalogCompany(company: Company): CatalogCompany {
  return {
    id: company.id,
    tradeName: company.tradeName,
    slug: company.slug,
    city: company.address?.city ?? null,
    state: company.address?.state ?? null,
    logoUrl: company.logoUrl ?? `/images/marketplace/company-logo-${(companyMocks.indexOf(company) % 3) + 1}.webp`,
    bannerUrl: company.bannerUrl ?? "/images/marketplace/solar-roof.webp",
    activities: company.activities,
    hasTechnicalTeam: company.hasTechnicalTeam,
  };
}

export function getCatalogCompanies(): Promise<CatalogCompany[]> {
  return resolveWithMocks(
    () =>
      httpJson<CatalogCompany[]>(`${API_CORE_URL}/catalog/companies`, {
        service: SERVICE_NAME,
        operation: "getCatalogCompanies",
        authenticated: false,
        errorMessage: i18n.t("services:company.getCatalogCompanies"),
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
        errorMessage: i18n.t("services:company.getCatalogCompanyBySlug"),
      }),
    () => {
      const company = companyMocks.find((item) => item.slug === slug && item.status === "APPROVED");
      if (!company) throw createServiceError(SERVICE_NAME, "getCatalogCompanyBySlug", i18n.t("services:company.supplierNotFound", { slug }));
      return mockCatalogCompany(company);
    },
  );
}

export interface MyMembership {
  companyId: string;
  position: { id: string; name: string };
  permissions?: string[];
}

export async function getMyMemberships(): Promise<MyMembership[]> {
  if (isAlwaysMockMode())
    return getOperationalAccount().memberships.map((item) => ({
      companyId: item.id,
      position: { id: "mock-position", name: item.admin ? "ADMIN" : "MEMBER" },
    }));
  await getMyUser();
  return httpJson<MyMembership[]>(`${API_CORE_URL}/user-companies/me/all`, {
    service: SERVICE_NAME,
    operation: "getMyCompanyMembership",
    errorMessage: i18n.t("services:company.getMyCompanyMembership"),
  });
}

export async function getMyContexts() {
  const user = await getMyUser();
  const memberships = await getMyMemberships();
  const companies = await Promise.all(
    memberships.map((membership) =>
      httpJson<Company>(`${API_CORE_URL}/companies/${encodeURIComponent(membership.companyId)}`, {
        service: SERVICE_NAME,
        operation: "getMyCompany",
        errorMessage: i18n.t("services:company.getMyCompanyMembership"),
      }),
    ),
  );
  return { memberships, companies, managedByCompanyId: user.managedByCompanyId ?? null };
}

export async function getMyMembership(): Promise<MyMembership | null> {
  if (isAlwaysMockMode()) {
    const account = getOperationalAccount();
    const membership = account.memberships.find((item) => item.id === account.selectedContext) ?? account.memberships[0];
    return membership ? { companyId: membership.id, position: { id: "mock-position", name: membership.admin ? "ADMIN" : "MEMBER" } } : null;
  }
  const memberships = await getMyMemberships();
  const selected = getSelectedContext();
  return memberships.find((item) => item.companyId === selected) ?? memberships[0] ?? null;
}

export async function getMyCompany(): Promise<Company | null> {
  if (isAlwaysMockMode()) {
    const account = getOperationalAccount();
    const membership = account.memberships.find((item) => item.id === account.selectedContext) ?? account.memberships[0];
    if (!membership) return null;
    const profile = membership.companyProfile;
    return {
      id: membership.id,
      type: membership.type,
      status: CompanyStatus.APPROVED,
      cnpj: profile?.cnpj ?? "",
      tradeName: membership.name,
      corporateName: profile?.corporateName ?? membership.name,
      slug: membership.id,
      businessContact: profile
        ? { companyEmail: profile.companyEmail, phone: profile.phone || undefined, website: profile.website || undefined }
        : undefined,
      address: profile
        ? {
            street: profile.street,
            number: profile.number,
            neighborhood: profile.neighborhood,
            city: profile.city,
            state: profile.state,
            zipCode: profile.zipCode,
            country: profile.country ?? "Brasil",
          }
        : undefined,
    };
  }
  const membership = await getMyMembership();
  if (!membership) return null;
  return httpJson<Company>(`${API_CORE_URL}/companies/${encodeURIComponent(membership.companyId)}`, {
    service: SERVICE_NAME,
    operation: "getMyCompany",
    errorMessage: i18n.t("services:company.getMyCompany"),
  });
}

export async function updateMyCompanyProfile(
  companyId: string,
  profile: Pick<Company, "tradeName" | "corporateName" | "businessContact" | "address">,
): Promise<Company> {
  if (!isAlwaysMockMode()) throw createServiceError(SERVICE_NAME, "updateMyCompanyProfile", i18n.t("services:company.profileEditingUnavailable"));
  await waitForMockService();
  const company = await getMyCompany();
  if (!company || company.id !== companyId)
    throw createServiceError(SERVICE_NAME, "updateMyCompanyProfile", i18n.t("services:company.activeCompanyNotFound"));
  const updated = { ...company, ...profile };
  const account = getOperationalAccount();
  saveOperationalAccount({
    ...account,
    memberships: account.memberships.map((membership) =>
      membership.id === companyId
        ? {
            ...membership,
            name: updated.tradeName,
            companyProfile: {
              cnpj: updated.cnpj,
              corporateName: updated.corporateName,
              companyEmail: updated.businessContact?.companyEmail ?? "",
              phone: updated.businessContact?.phone ?? "",
              website: updated.businessContact?.website ?? "",
              street: updated.address?.street ?? "",
              number: updated.address?.number ?? "",
              neighborhood: updated.address?.neighborhood ?? "",
              city: updated.address?.city ?? "",
              state: updated.address?.state ?? "",
              zipCode: updated.address?.zipCode ?? "",
              country: updated.address?.country ?? "",
            },
          }
        : membership,
    ),
  });
  return updated;
}

export function getCompany(id: string): Promise<Company> {
  return resolveWithMocks(
    () =>
      httpJson<Company>(`${API_CORE_URL}/companies/${id}`, {
        service: SERVICE_NAME,
        operation: "getCompany",
        errorMessage: i18n.t("services:company.getCompany", { id }),
      }),
    () => companyMocks.find((company) => company.id === id) ?? companyMocks[0],
  );
}

// Admin Solaria: aprovação/rejeição de empresas fica restrita ao platform admin
// no backend (ver RbacAuthorizationService.PLATFORM_ADMIN_ONLY_ENDPOINTS).
export async function approveCompany(id: string): Promise<Company> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return decideMockCompany(id, CompanyStatus.APPROVED);
  }
  return httpJson<Company>(`${API_CORE_URL}/companies/${encodeURIComponent(id)}/approval`, {
    service: SERVICE_NAME,
    operation: "approveCompany",
    method: "PATCH",
    errorMessage: i18n.t("services:company.approveCompany", { id }),
  });
}

export async function rejectCompany(id: string): Promise<Company> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return decideMockCompany(id, CompanyStatus.REJECTED);
  }
  return httpJson<Company>(`${API_CORE_URL}/companies/${encodeURIComponent(id)}/rejection`, {
    service: SERVICE_NAME,
    operation: "rejectCompany",
    method: "PATCH",
    errorMessage: i18n.t("services:company.rejectCompany", { id }),
  });
}

export async function listAllCompanies(): Promise<Company[]> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return getMockCompanyReviews();
  }
  return httpJson<Company[]>(`${API_CORE_URL}/companies`, {
    service: SERVICE_NAME,
    operation: "listAllCompanies",
    errorMessage: i18n.t("services:company.listAllCompanies"),
  });
}

export function getCompanies(ids: string[]): Promise<Company[]> {
  return resolveWithMocks(
    () =>
      httpJson<Company[]>(`${API_CORE_URL}/companies`, {
        service: SERVICE_NAME,
        operation: "getCompanies",
        errorMessage: i18n.t("services:company.getCompanies"),
      }).then((companies) => companies.filter((company) => ids.includes(company.id))),
    () => companyMocks,
  );
}
