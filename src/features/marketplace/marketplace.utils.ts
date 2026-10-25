import { CompanyActivity } from "@/features/companies/company.enum";
import type { CatalogCompany } from "@/features/companies/company.service";
import type { SolarPanelFeedSummary } from "@/features/solar-panel/solarPanel.announcement";

export type FeedCategory = "solarPanels" | "infrastructure" | "professionals" | "companies";

export function matchesMarketplaceQuery(query: string, ...values: (string | null | undefined)[]): boolean {
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase();
  return normalize(values.filter(Boolean).join(" ")).includes(normalize(query.trim()));
}

export const feedViews: Record<FeedCategory, string[]> = {
  solarPanels: ["recent", "trending"],
  infrastructure: ["recent", "trending"],
  professionals: ["professionals", "independent", "teams"],
  companies: ["all", "suppliers", "providers", "other"],
};

export function getFeedView(category: FeedCategory, value: string | null): string {
  return value && feedViews[category].includes(value) ? value : feedViews[category][0];
}

export function filterCompanies(items: CatalogCompany[], view: string): CatalogCompany[] {
  return items.filter((company) => {
    if (view === "all") return true;
    const activities = company.activities ?? [];
    if (view === "suppliers") return activities.includes(CompanyActivity.SOLAR_PANELS);
    if (view === "providers")
      return activities.some((activity) => [CompanyActivity.TECHNICIANS, CompanyActivity.MAINTENANCE, CompanyActivity.INSPECTION].includes(activity));
    return activities.length === 0;
  });
}

export function sortOffers<T extends SolarPanelFeedSummary>(items: T[], view: string): T[] {
  return [...items].sort((a, b) => {
    if (view === "trending") return (b.trendingScore ?? -1) - (a.trendingScore ?? -1);
    const timestamp = (value?: string) => (value && Number.isFinite(Date.parse(value)) ? Date.parse(value) : 0);
    return timestamp(b.publishedAt) - timestamp(a.publishedAt);
  });
}
