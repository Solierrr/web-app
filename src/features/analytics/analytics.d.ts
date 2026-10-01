export type AnalyticsScope = "platform" | "supplier" | "demandant";

export interface Kpi {
  key: string;
  value: number;
}

export interface KpiResult {
  kpis: Kpi[];
  failed: boolean;
}
