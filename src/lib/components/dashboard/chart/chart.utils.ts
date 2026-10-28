import type { EChartsCoreOption } from "echarts/core";
import type { CartesianPayload, DistributionPayload, DashboardNumberFormat } from "../dashboard.d";
import { formatDashboardValue, dashboardPalette, dashboardMonochromaticPalette } from "../dashboard.utils";

export interface ChartTheme {
  colors: string[];
  text: string;
  muted: string;
  border: string;
  background: string;
  font: string;
  fontSize: number;
  weight: number;
  reducedMotion: boolean;
}

export function chartTheme(element: HTMLElement, monochromatic = false): ChartTheme {
  const styles = getComputedStyle(element);
  const token = (name: string) => styles.getPropertyValue(name).trim();
  return {
    colors: (monochromatic ? dashboardMonochromaticPalette : dashboardPalette).map((name) => token(`--color-${name}`)),
    text: token("--color-black"),
    muted: token("--color-operational-muted"),
    border: token("--color-border"),
    background: token("--color-white"),
    font: styles.fontFamily,
    fontSize: parseFloat(styles.fontSize),
    weight: Number(styles.fontWeight),
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
}

export type SparklinePattern = "stripes" | "dots" | "cross";

const PATTERN_TILES: Record<SparklinePattern, (color: string) => string> = {
  stripes: (color) => `<path d="M-1 7L7 -1M-1 3L3 -1M5 7L7 5" stroke="${color}" stroke-width="1.4"/>`,
  dots: (color) => `<circle cx="4" cy="4" r="1.5" fill="${color}"/>`,
  cross: (color) => `<path d="M4 1.5V6.5M1.5 4H6.5" stroke="${color}" stroke-width="1.2"/>`,
};

/** Textura da área da sparkline: cada KPI ganha uma trama própria, que o distingue sem depender da cor (impressão em preto e branco, daltonismo). */
function patternFill(pattern: SparklinePattern, color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8">${PATTERN_TILES[pattern](color)}</svg>`;
  return { image: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, repeat: "repeat" as const };
}

export function chartOptions(
  payload: CartesianPayload | DistributionPayload,
  kind: "line" | "area" | "bar" | "donut" | "sparkline",
  theme: ChartTheme,
  format: DashboardNumberFormat,
  stacked = false,
  pattern?: SparklinePattern,
): EChartsCoreOption {
  const compact = kind === "sparkline";
  const textStyle = { fontFamily: theme.font, fontSize: theme.fontSize, fontWeight: theme.weight, color: theme.text };
  const base: EChartsCoreOption = {
    color: theme.colors,
    textStyle,
    animation: !theme.reducedMotion,
    animationDuration: 300,
    animationDurationUpdate: 200,
    tooltip: {
      trigger: kind === "donut" ? "item" : "axis",
      renderMode: "richText",
      backgroundColor: theme.background,
      borderColor: theme.border,
      textStyle,
      confine: true,
      valueFormatter: (value: unknown) => (typeof value === "number" ? formatDashboardValue(value, format) : ""),
    },
    legend: {
      show: !compact,
      bottom: 0,
      type: "scroll",
      selectedMode: true,
      selected: Object.fromEntries(
        ("items" in payload ? payload.items.map((item) => item.label) : payload.series.map((series) => series.name)).map((name) => [name, true]),
      ),
      textStyle: { ...textStyle, color: theme.muted },
    },
  };
  if ("items" in payload)
    return {
      ...base,
      series: [
        {
          type: "pie",
          colorBy: "data",
          radius: ["48%", "72%"],
          center: ["50%", "43%"],
          label: { show: false },
          data: payload.items
            .filter((item) => Number.isFinite(item.value) && item.value >= 0)
            .map((item) => ({ name: item.label, value: item.value })),
        },
      ],
    };
  return {
    ...base,
    grid: compact ? { left: 0, right: 0, top: 6, bottom: 0 } : { left: 8, right: 16, top: 16, bottom: 52, containLabel: true },
    xAxis: {
      type: "category",
      data: payload.labels,
      boundaryGap: kind === "bar",
      show: !compact,
      axisLine: { lineStyle: { color: theme.border } },
      axisTick: { show: false },
      axisLabel: { ...textStyle, color: theme.muted, hideOverlap: true },
    },
    yAxis: {
      type: "value",
      show: !compact,
      axisLabel: { ...textStyle, color: theme.muted, formatter: (value: number) => formatDashboardValue(value, format) },
      splitLine: { lineStyle: { color: theme.border, type: "dashed" } },
    },
    series: payload.series.map((series, index) => ({
      name: series.name,
      type: kind === "bar" ? "bar" : "line",
      data: payload.labels.map((_, index) => (Number.isFinite(series.values[index]) ? series.values[index] : null)),
      stack: stacked ? "total" : undefined,
      showSymbol: false,
      connectNulls: false,
      smooth: kind === "bar" ? undefined : 0.18,
      smoothMonotone: "x",
      barMaxWidth: 36,
      areaStyle:
        kind === "bar"
          ? undefined
          : compact && pattern
            ? { opacity: 0.55, color: patternFill(pattern, theme.colors[index % theme.colors.length]) }
            : {
                opacity: compact ? 0.2 : 0.16,
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: theme.colors[index % theme.colors.length] },
                    { offset: 1, color: `${theme.background}00` },
                  ],
                },
              },
      lineStyle: { width: compact ? 2.5 : 2, cap: "round", join: "round", type: index > 0 ? "dashed" : "solid" },
    })),
  };
}
