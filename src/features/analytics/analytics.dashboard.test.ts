import { describe, expect, it } from "vitest";
import type { AnalyticsDashboard } from "./analytics";
import { getAnalyticsDashboardMock } from "./analytics.d.mocks";
import { buildPlatformView, buildRequesterView, buildSupplierView, buildView, toNumber } from "./analytics.dashboard";

describe("toNumber", () => {
  it("accepts numbers and numeric strings and rejects empty values", () => {
    expect(toNumber(4)).toBe(4);
    expect(toNumber("12.50")).toBe(12.5);
    expect(toNumber(null)).toBeNull();
    expect(toNumber("")).toBeNull();
    expect(toNumber("abc")).toBeNull();
  });
});

describe("buildSupplierView", () => {
  const view = buildSupplierView(getAnalyticsDashboardMock("SUPPLIER", "c1"));

  it("reads the summary tables into metrics", () => {
    const byId = Object.fromEntries(view.metrics.map((metric) => [metric.id, metric]));
    expect(byId.activeOffers.value).toBe(9);
    expect(byId.stockUnits.value).toBe(340);
    expect(byId.acceptanceRate).toMatchObject({ value: 62.5, unit: "%" });
    expect(byId.acceptedValue).toMatchObject({ value: 184000, unit: "R$" });
  });

  it("groups the status tables and orders the months", () => {
    expect(view.distributions.find((item) => item.id === "offersByStatus")?.items).toEqual([
      { key: "ACTIVE", value: 9 },
      { key: "EXPIRED", value: 1 },
    ]);
    expect(view.series[0]).toEqual({ id: "acceptedValueByMonth", labels: ["2026-09", "2026-10"], values: [64000, 120000] });
  });

  it("ranks models from the highest value", () => {
    expect(view.rankings[0].items.map((item) => item.label)).toEqual(["Modelo 550W", "Modelo 450W"]);
  });

  it("keeps at most eight ranking entries", () => {
    const rows = Array.from({ length: 12 }, (_, index) => ({ model_name: `M${index}`, stock_units: index }));
    const many: AnalyticsDashboard = { scope: "SUPPLIER", companyId: null, loadedAt: null, kpis: { kpi_supplier_stock_by_model: rows } };
    expect(buildSupplierView(many).rankings[1].items).toHaveLength(8);
  });
});

describe("empty and partial data", () => {
  it("does not fail when a table is missing and leaves the value empty", () => {
    const view = buildSupplierView({ scope: "SUPPLIER", companyId: null, loadedAt: null, kpis: {} });
    expect(view.metrics.every((metric) => metric.value === null)).toBe(true);
    expect(view.series[0].labels).toEqual([]);
  });

  it("ignores rows with an empty key or a non numeric value", () => {
    const view = buildRequesterView({
      scope: "REQUESTER",
      companyId: null,
      loadedAt: null,
      kpis: {
        kpi_requester_proposals_by_status: [
          { proposal_status: "", proposal_count: 3 },
          { proposal_status: "PENDING", proposal_count: "x" },
        ],
      },
    });
    expect(view.distributions[0].items).toEqual([]);
  });
});

describe("buildView", () => {
  it("picks the builder by scope", () => {
    expect(buildView(getAnalyticsDashboardMock("PLATFORM")).metrics.map((metric) => metric.id)).toEqual(["activeSuppliers", "registeredRequesters"]);
    expect(buildView(getAnalyticsDashboardMock("REQUESTER", "c2")).metrics.map((metric) => metric.id)).toEqual([
      "localUnits",
      "proposals",
      "projects",
    ]);
    expect(buildPlatformView(getAnalyticsDashboardMock("PLATFORM")).metrics[0].value).toBe(11);
  });
});
