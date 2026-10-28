import i18n from "@/config/i18n/internationalization";
import { createServiceError } from "@/config/logging/serviceError.utils";
import { resolveWithMocks } from "@/config/mocks/fallback.service";
import { httpJson } from "@/lib/shared/http/http.service";
import { API_CORE_URL } from "@/lib/shared/http/apiCore.utils";
import { professionalMocks } from "@/config/mocks/registry";
import type { TechnicalAffiliationType } from "./professional.enum";
import type { ProfessionalRegistration } from "./professional";
import { mockProfessionalBanners } from "@/config/mocks/catalogMedia";

const SERVICE_NAME = "professional";

export interface CatalogTechnician {
  id: string;
  /** Usuário da conta do profissional (`PersonResponseDTO.userId`); necessário para adicionar como conexão. */
  userId?: string;
  about?: string | null;
  slug: string;
  name: string;
  crea: string;
  professions: string[];
  affiliationType?: TechnicalAffiliationType;
  avatarUrl?: string;
  bannerUrl?: string;
  registrations?: ProfessionalRegistration[];
  city?: string | null;
  state?: string | null;
  contact?: { email?: string; number?: string };
}

function mockAbout(professional: { registrations?: ProfessionalRegistration[]; address?: { city?: string } }): string {
  const profession = professional.registrations?.[0]?.profession ?? "Profissional";
  const city = professional.address?.city ? ` em ${professional.address.city}` : "";
  return `${profession} com atuação${city}. Acompanho projetos de energia solar residenciais e comerciais, do dimensionamento à instalação e à manutenção.`;
}

function mockCatalogTechnician(professional: {
  id: string;
  name: string;
  slug: string;
  registrations?: ProfessionalRegistration[];
  affiliationType?: TechnicalAffiliationType;
  avatar?: string;
  address?: { city?: string; state?: string };
  contact?: { email?: string; number?: string };
}): CatalogTechnician {
  return {
    id: professional.id,
    userId: professional.id,
    about: mockAbout(professional),
    slug: professional.slug,
    name: professional.name,
    crea: professional.registrations?.map((registration) => `${registration.council} ${registration.number}`).join(", ") ?? "",
    registrations: professional.registrations,
    affiliationType: professional.affiliationType,
    professions: professional.registrations?.map((registration) => registration.profession) ?? [],
    avatarUrl: professional.avatar,
    bannerUrl: mockProfessionalBanners[professionalMocks.findIndex((item) => item.id === professional.id) % mockProfessionalBanners.length],
    city: professional.address?.city,
    state: professional.address?.state,
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
