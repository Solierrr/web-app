import { describe, expect, it } from "vitest";
import { bestSellers, onSale, newArrivals } from "./SolarPanelFeed.utils";
import type { SolarPanelFeedSummary } from "@/features/solar-panel/solarPanelAnnouncement";

function summary(overrides: Partial<SolarPanelFeedSummary>): SolarPanelFeedSummary {
  return {
    id: overrides.id ?? "1",
    slug: overrides.slug ?? "produto",
    companySlug: "solaria-energia",
    title: overrides.title ?? "Produto",
    unitPrice: 200,
    photos: { heroImage: { description: "Placa solar", url: "https://example.com/1.png" }, otherImages: [] },
    ...overrides,
  };
}

describe("SolarPanelFeed.utils", () => {
  describe("bestSellers", () => {
    it("sorts items by soldUnits, highest first", () => {
      const items = [summary({ id: "1", soldUnits: 10 }), summary({ id: "2", soldUnits: 90 }), summary({ id: "3", soldUnits: 40 })];

      expect(bestSellers(items).map((item) => item.id)).toEqual(["2", "3", "1"]);
    });

    it("treats a missing soldUnits as 0", () => {
      const items = [summary({ id: "1" }), summary({ id: "2", soldUnits: 5 })];

      expect(bestSellers(items).map((item) => item.id)).toEqual(["2", "1"]);
    });
  });

  describe("onSale", () => {
    it("keeps only items with a discount above 0", () => {
      const items = [summary({ id: "1", discountPercentage: 10 }), summary({ id: "2" }), summary({ id: "3", discountPercentage: 0 })];

      expect(onSale(items).map((item) => item.id)).toEqual(["1"]);
    });
  });

  describe("newArrivals", () => {
    it("sorts items by createdAt, most recent first", () => {
      const items = [
        summary({ id: "1", createdAt: "2026-01-01T00:00:00.000Z" }),
        summary({ id: "2", createdAt: "2026-03-01T00:00:00.000Z" }),
        summary({ id: "3", createdAt: "2026-02-01T00:00:00.000Z" }),
      ];

      expect(newArrivals(items).map((item) => item.id)).toEqual(["2", "3", "1"]);
    });
  });
});
