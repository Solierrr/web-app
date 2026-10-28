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

export type FeedBanner = "sunset" | "installer" | "house" | "garden" | "cabins" | "field";

export const feedBanners: FeedBanner[] = ["sunset", "installer", "house", "garden", "cabins", "field"];

export type FeedHighlightFormat = "collections" | "pair" | FeedBanner;

export const feedHighlightFormats: FeedHighlightFormat[] = ["collections", "pair", ...feedBanners];

export type OfferShelfKind = "trending" | "recent" | "efficiency" | "power" | "price" | "discount" | "supplier" | "all";

export interface OfferShelf<T> {
  key: string;
  kind: OfferShelfKind;
  name?: string;
  items: T[];
}

const SHELF_MIN = 3;
const SHELF_MAX = 12;

export function buildOfferShelves<T extends SolarPanelFeedSummary & { panel: { efficiency?: number | null; powerOutput?: number | null }; company: { id: string; tradeName: string } }>(
  items: T[],
): OfferShelf<T>[] {
  const by = (score: (item: T) => number | null | undefined, direction = -1) =>
    items
      .filter((item) => typeof score(item) === "number")
      .sort((a, b) => direction * ((score(a) as number) - (score(b) as number)))
      .slice(0, SHELF_MAX);
  const trending = items.some((item) => typeof item.trendingScore === "number");
  const groups = new Map<string, T[]>();
  for (const item of items) groups.set(item.company.id, [...(groups.get(item.company.id) ?? []), item]);
  const suppliers = [...groups.values()]
    .filter((group) => group.length >= SHELF_MIN)
    .sort((a, b) => b.length - a.length);
  const shelves: OfferShelf<T>[] = [
    { key: "lead", kind: trending ? "trending" : "recent", items: sortOffers(items, trending ? "trending" : "recent").slice(0, SHELF_MAX) },
    { key: "efficiency", kind: "efficiency", items: by((item) => item.panel.efficiency) },
    { key: "price", kind: "price", items: by((item) => item.unitPrice, 1) },
    ...suppliers.slice(0, 1).map((group) => ({ key: `supplier-${group[0].company.id}`, kind: "supplier" as const, name: group[0].company.tradeName, items: group.slice(0, SHELF_MAX) })),
    { key: "power", kind: "power", items: by((item) => item.panel.powerOutput) },
    { key: "discount", kind: "discount", items: by((item) => item.discountPercentage || null) },
    ...suppliers.slice(1).map((group) => ({ key: `supplier-${group[0].company.id}`, kind: "supplier" as const, name: group[0].company.tradeName, items: group.slice(0, SHELF_MAX) })),
  ];
  return shelves.filter((shelf) => shelf.items.length >= SHELF_MIN);
}
