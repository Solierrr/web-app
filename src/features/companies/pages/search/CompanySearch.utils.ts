import type { CatalogCompany } from "@/features/companies/company.service";
import type { EntityCardItem } from "@/lib/components/layout/announcement/entity-card/EntityCard";
import type { SupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";

export function toCardItem(company: CatalogCompany, lang: SupportedLanguage): EntityCardItem {
  return {
    id: company.id,
    name: company.tradeName,
    avatarUrl: company.logoUrl,
    subtitle: company.city && company.state ? `${company.city}/${company.state}` : undefined,
    href: routePaths.companyProfile(lang, company.slug),
  };
}
