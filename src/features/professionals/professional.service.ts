import i18n from "@/config/i18n/internationalization";
import { createServiceError } from "@/config/logging/serviceError.utils";
import { resolveWithMocks } from "@/config/mocks/fallback.service";
import { httpJson } from "@/lib/shared/http/http.service";
import { API_CORE_URL } from "@/lib/shared/http/apiCore.utils";
import { professionalMocks } from "@/config/mocks/registry";
import type { TechnicalAffiliationType } from "./professional.enum";

const SERVICE_NAME = "professional";

export interface CatalogTechnician {
  id: string;
  slug: string;
  name: string;
  crea: string;
  professions: string[];
  affiliationType?: TechnicalAffiliationType;
  avatarUrl?: string;
  contact?: { email?: string; number?: string };
}

function mockCatalogTechnician(professional: {
  id: string;
  name: string;
  slug: string;
  registrations?: { profession: string }[];
  affiliationType?: TechnicalAffiliationType;
  avatar?: string;
  contact?: { email?: string; number?: string };
}): CatalogTechnician {
  return {
    id: professional.id,
    slug: professional.slug,
    name: professional.name,
    crea: "",
    affiliationType: professional.affiliationType,
    professions: professional.registrations?.map((registration) => registration.profession) ?? [],
    avatarUrl: professional.avatar,
    contact: professional.contact,
  };
}

export function getCatalogTechnicians(): Promise<CatalogTechnician[]> {
  return resolveWithMocks(
    () =>
      httpJson<CatalogTechnician[]>(`${API_CORE_URL}/catalog/technicians`, {
        service: SERVICE_NAME,
        operation: "getCatalogTechnicians",
        authenticated: false,
        errorMessage: i18n.t("services:professional.getCatalogTechnicians"),
      }),
    () => professionalMocks.map(mockCatalogTechnician),
  );
}

export function getCatalogTechnicianBySlug(slug: string): Promise<CatalogTechnician> {
  return resolveWithMocks(
    () =>
      httpJson<CatalogTechnician>(`${API_CORE_URL}/catalog/technicians/${encodeURIComponent(slug)}`, {
        service: SERVICE_NAME,
        operation: "getCatalogTechnicianBySlug",
        authenticated: false,
        errorMessage: i18n.t("services:professional.getCatalogTechnicianBySlug"),
      }),
    () => {
      const professional = professionalMocks.find((item) => item.slug === slug);
      if (!professional) throw createServiceError(SERVICE_NAME, "getCatalogTechnicianBySlug", i18n.t("services:professional.notFound", { slug }));
      return mockCatalogTechnician(professional);
    },
  );
}
