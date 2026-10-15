import { describe, expect, it } from "vitest";
import { chartOptions, type ChartTheme } from "./chart.utils";
import { formatDashboardValue, hasChartData } from "../dashboard.utils";

const theme: ChartTheme = {
  colors: ["orange"],
  text: "black",
  muted: "gray",
  border: "gray",
  background: "white",
  font: "sans-serif",
  fontSize: 16,
  weight: 500,
  reducedMotion: true,
};

describe("dashboard payloads", () => {
  it("keeps zero as data and distinguishes missing or non-finite values", () => {
    expect(hasChartData({ labels: ["A"], series: [{ name: "Energy", values: [0] }] })).toBe(true);
    expect(hasChartData({ labels: ["A"], series: [{ name: "Energy", values: [null, 12] }] })).toBe(false);
    expect(hasChartData({ labels: ["A"], series: [{ name: "Energy", values: [NaN] }] })).toBe(false);
  });
  it("aligns values with labels and preserves gaps instead of inventing zeros", () => {
    const options = chartOptions({ labels: ["A", "B", "C"], series: [{ name: "Energy", values: [0, null] }] }, "area", theme, {});
    const series = options.series as { data: (number | null)[]; connectNulls: boolean }[];
    expect(series[0].data).toEqual([0, null, null]);
    expect(series[0].connectNulls).toBe(false);
    expect(options.animation).toBe(false);
    expect((options.tooltip as { renderMode: string }).renderMode).toBe("richText");
  });
  it("formats payload values using the consumer locale and unit", () => {
    expect(formatDashboardValue(12.25, { locale: "pt-BR", unit: "kWh", maximumFractionDigits: 1 })).toBe("12,3 kWh");
    expect(formatDashboardValue(12.25, { locale: "en-US", unit: "%" })).toBe("12.25 %");
  });
  it("starts a distribution with every category visible", () => {
    const options = chartOptions(
      {
        items: [
          { label: "Panels", value: 46 },
          { label: "Services", value: 31 },
        ],
      },
      "donut",
      theme,
      {},
    );
    expect((options.legend as { selected: Record<string, boolean> }).selected).toEqual({ Panels: true, Services: true });
    expect((options.series as { colorBy: string }[])[0].colorBy).toBe("data");
  });
});
