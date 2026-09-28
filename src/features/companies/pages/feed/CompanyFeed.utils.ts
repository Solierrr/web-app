import type { Company } from "@/features/companies/company";
import type { EntityCardItem } from "@/components/layout/announcement/entity-card/EntityCard";
import type { SupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { slugNormalization } from "@/utils/normalization.utils";

const mockFeedDetails: Record<string, { featuredOrder: number; createdAt: string; highlights: string[] }> = {
  "company-1": {
    featuredOrder: 1,
    createdAt: "2026-08-14",
    highlights: ["company.highlights.solarProjects", "company.highlights.residential"],
  },
  "company-2": {
    featuredOrder: 2,
    createdAt: "2026-09-03",
    highlights: ["company.highlights.installation", "company.highlights.commercial"],
  },
  "company-3": {
    featuredOrder: 3,
    createdAt: "2026-09-18",
    highlights: ["company.highlights.equipment", "company.highlights.solarPanels"],
  },
};

export interface CompanyFeedItem {
  company: Company;
  bannerUrl: string;
  logoUrl: string;
  highlights: string[];
  featuredOrder?: number;
  createdAt?: string;
}

export function toCompanyFeedItem(company: Company): CompanyFeedItem {
  const mockDetails = mockFeedDetails[company.id];
  const mockIndex = Number(company.id.match(/\d+$/)?.[0] ?? 1);

  return {
    company,
    bannerUrl: mockDetails ? `/images/mocks/companies/banners/company-${String(mockIndex).padStart(2, "0")}.jpg` : company.bannerUrl ?? "",
    logoUrl: mockDetails ? `/images/mocks/companies/logos/company-${String(mockIndex).padStart(2, "0")}.jpg` : company.logoUrl ?? "",
    highlights: mockDetails?.highlights ?? [],
    featuredOrder: mockDetails?.featuredOrder,
    createdAt: mockDetails?.createdAt,
  };
}

export function toCardItem(company: Company, lang: SupportedLanguage): EntityCardItem {
  return {
    id: company.id,
    name: company.tradeName,
    avatarUrl: company.logoUrl,
    subtitle: company.address ? `${company.address.city}/${company.address.state}` : undefined,
    href: routePaths.companyProfile(lang, company.slug || slugNormalization(company.tradeName)),
  };
}

export function orderFeaturedCompanies(items: CompanyFeedItem[]): CompanyFeedItem[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => (a.item.featuredOrder ?? Number.MAX_SAFE_INTEGER) - (b.item.featuredOrder ?? Number.MAX_SAFE_INTEGER) || a.index - b.index)
    .map(({ item }) => item);
}

export function orderRecentCompanies(items: CompanyFeedItem[]): CompanyFeedItem[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      if (!a.item.createdAt || !b.item.createdAt) return a.index - b.index;
      return b.item.createdAt.localeCompare(a.item.createdAt);
    })
    .map(({ item }) => item);
}
