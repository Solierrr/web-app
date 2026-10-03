import type { CatalogCompany } from "@/features/companies/company.service";
import type { Company } from "@/features/companies/company";
import type { EntityCardItem } from "@/lib/components/layout/announcement/entity-card/EntityCard";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";

export interface CompanyFeedItem {
  company: Company;
  bannerUrl: string;
  logoUrl: string;
  highlights: string[];
  featuredOrder?: number;
  createdAt?: string;
}

export function toCardItem(company: CatalogCompany, lang: SupportedLanguage): EntityCardItem {
  return {
    id: company.id,
    name: company.tradeName,
    avatarUrl: company.logoUrl,
    subtitle: company.city && company.state ? `${company.city}/${company.state}` : undefined,
    href: routePaths.companyProfile(lang, company.slug),
  };
}
