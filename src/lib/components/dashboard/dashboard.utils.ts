import type { CartesianPayload, DashboardNumberFormat } from "./dashboard.d";

export const dashboardPalette = ["orange", "feedback-info", "feedback-success", "orange-gold", "orange-coral"];
export const dashboardMonochromaticPalette = ["orange", "orange-copper", "action-highlight", "orange-gold", "orange-coral"];

export function createDashboardColorOrder(): number[] {
  const order = dashboardPalette.map((_, index) => index);
  for (let index = order.length - 1; index > 0; index--) {
    const target = Math.floor(Math.random() * (index + 1));
    [order[index], order[target]] = [order[target], order[index]];
  }
  return order;
}

export function formatDashboardValue(value: number, { locale = "pt-BR", unit, maximumFractionDigits = 2 }: DashboardNumberFormat = {}): string {
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value)}${unit ? ` ${unit}` : ""}`;
}

export function hasChartData(payload: CartesianPayload): boolean {
  return (
    payload.labels.length > 0 &&
    payload.series.some((series) => series.values.slice(0, payload.labels.length).some((value) => value !== null && Number.isFinite(value)))
  );
}
