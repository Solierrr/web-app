import type { SolarPanelFeedSummary } from "@/features/solar-panel/solarPanelAnnouncement";

const SECTION_SIZE = 8;

export function bestSellers(items: SolarPanelFeedSummary[]): SolarPanelFeedSummary[] {
  return [...items].sort((a, b) => (b.soldUnits ?? 0) - (a.soldUnits ?? 0)).slice(0, SECTION_SIZE);
}

export function onSale(items: SolarPanelFeedSummary[]): SolarPanelFeedSummary[] {
  return items.filter((item) => (item.discountPercentage ?? 0) > 0).slice(0, SECTION_SIZE);
}

export function newArrivals(items: SolarPanelFeedSummary[]): SolarPanelFeedSummary[] {
  return [...items].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()).slice(0, SECTION_SIZE);
}
