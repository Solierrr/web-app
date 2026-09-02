import type { Company } from "@/features/companies/company";
import type { EntityCardItem } from "@/components/layout/announcement/entity-card/EntityCard";
import type { SupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";

export function toCardItem(company: Company, lang: SupportedLanguage): EntityCardItem {
  return {
    id: company.id,
    name: company.tradeName,
    avatarUrl: company.logoUrl,
    subtitle: company.address ? `${company.address.city}/${company.address.state}` : undefined,
    href: routePaths.companyProfile(lang, company.slug),
  };
}
