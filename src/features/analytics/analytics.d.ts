export type AnalyticsScope = "platform" | "supplier" | "demandant";

export interface Kpi {
  key: string;
  value: number;
}

export interface KpiResult {
  kpis: Kpi[];
  failed: boolean;
}

export type KpiRow = Record<string, string | number | null>;

/** Resposta de GET /api/analytics/*: linhas das tabelas Gold já filtradas pelo banco. */
export interface AnalyticsDashboard {
  scope: "PLATFORM" | "SUPPLIER" | "REQUESTER";
  companyId: string | null;
  loadedAt: string | null;
  kpis: Record<string, KpiRow[]>;
  /** Só no dashboard da plataforma: id do fornecedor para o nome fantasia. */
  names?: Record<string, string>;
}

export interface DashboardMetric {
  id: string;
  value: number | null;
  unit?: string;
}

export interface DashboardDistribution {
  id: string;
  items: { key: string; value: number }[];
}

export interface DashboardSeries {
  id: string;
  labels: string[];
  values: number[];
  unit?: string;
}

export type TableColumnFormat = "text" | "number" | "money" | "date" | "status";

export interface DashboardTable {
  id: string;
  columns: { key: string; format: TableColumnFormat }[];
  rows: KpiRow[];
}

export interface DashboardRanking {
  id: string;
  items: { label: string; value: number }[];
}

/** Dados prontos para desenhar, sem texto traduzido: a página traduz pelos ids. */
export interface DashboardView {
  metrics: DashboardMetric[];
  distributions: DashboardDistribution[];
  series: DashboardSeries[];
  rankings: DashboardRanking[];
  tables: DashboardTable[];
}
