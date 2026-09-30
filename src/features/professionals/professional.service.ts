import { resolveWithMocks } from "@/config/mocks/fallback.service";
import { httpJson } from "@/shared/http/http.service";
import { API_CORE_URL } from "@/shared/http/apiCore.utils";
import { professionalMocks } from "@/config/mocks/registry";

const SERVICE_NAME = "professional";

export interface CatalogTechnician {
  id: string;
  slug: string;
  name: string;
  crea: string;
  professions: string[];
}

function mockCatalogTechnician(professional: { id: string; name: string; slug: string; registrations?: { profession: string }[] }): CatalogTechnician {
  return {
    id: professional.id,
    slug: professional.slug,
    name: professional.name,
    crea: "",
    professions: professional.registrations?.map((registration) => registration.profession) ?? [],
  };
}

export function getCatalogTechnicians(): Promise<CatalogTechnician[]> {
  return resolveWithMocks(
    () => httpJson<CatalogTechnician[]>(`${API_CORE_URL}/catalog/technicians`, {
      service: SERVICE_NAME,
      operation: "getCatalogTechnicians",
      authenticated: false,
      errorMessage: "Não foi possível carregar os profissionais",
    }),
    () => professionalMocks.map(mockCatalogTechnician),
  );
}

export function getCatalogTechnicianBySlug(slug: string): Promise<CatalogTechnician> {
  return resolveWithMocks(
    () => httpJson<CatalogTechnician>(`${API_CORE_URL}/catalog/technicians/${encodeURIComponent(slug)}`, {
      service: SERVICE_NAME,
      operation: "getCatalogTechnicianBySlug",
      authenticated: false,
      errorMessage: "Não foi possível carregar o profissional",
    }),
    () => {
      const professional = professionalMocks.find((item) => item.slug === slug);
      if (!professional) throw new Error(`Profissional não encontrado: ${slug}`);
      return mockCatalogTechnician(professional);
    },
  );
}
