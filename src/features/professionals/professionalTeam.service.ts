import { httpJson } from "@/lib/shared/http/http.service";
import { API_CORE_URL } from "@/lib/shared/http/apiCore.utils";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import { getCatalogCompanies, type CatalogCompany } from "@/features/companies/company.service";
import i18n from "@/config/i18n/internationalization";

export interface CatalogTeam {
  id: string;
  companyId: string;
  companyName: string;
  companySlug: string;
  name: string;
  members: { id: string; name: string; slug: string }[];
}

export async function getCatalogTeams(): Promise<CatalogTeam[]> {
  if (isAlwaysMockMode()) {
    return (await getCatalogCompanies())
      .filter((company) => company.hasTechnicalTeam)
      .map((company) => ({
        id: `team-${company.id}`,
        companyId: company.id,
        companyName: company.tradeName,
        companySlug: company.slug,
        name: company.tradeName,
        members: [],
      }));
  }
  return httpJson<CatalogTeam[]>(`${API_CORE_URL}/catalog/teams`, {
    service: "professionalTeam",
    operation: "getCatalogTeams",
    errorMessage: i18n.t("feed:professional.loadError"),
  });
}

export function teamCompany(team: CatalogTeam): CatalogCompany {
  return { id: team.id, slug: team.companySlug, tradeName: team.name, city: null, state: null, activities: [] };
}
