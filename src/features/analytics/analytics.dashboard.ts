import type { AnalyticsDashboard, DashboardMetric, DashboardRanking, DashboardView, KpiRow } from "./analytics";

const RANKING_LIMIT = 8;

function rows(dashboard: AnalyticsDashboard, table: string): KpiRow[] {
  return dashboard.kpis[table] ?? [];
}

export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function field(row: KpiRow | undefined, name: string): number | null {
  return row ? toNumber(row[name]) : null;
}

function distribution(dashboard: AnalyticsDashboard, id: string, table: string, keyColumn: string, valueColumn: string) {
  const totals = new Map<string, number>();
  for (const row of rows(dashboard, table)) {
    const key = String(row[keyColumn] ?? "");
    const value = toNumber(row[valueColumn]);
    if (key && value !== null) totals.set(key, (totals.get(key) ?? 0) + value);
  }
  return { id, items: [...totals].map(([key, value]) => ({ key, value })) };
}

function ranking(dashboard: AnalyticsDashboard, id: string, table: string, labelColumn: string, valueColumn: string): DashboardRanking {
  const totals = new Map<string, number>();
  for (const row of rows(dashboard, table)) {
    const label = String(row[labelColumn] ?? "");
    const value = toNumber(row[valueColumn]);
    if (label && value !== null) totals.set(label, (totals.get(label) ?? 0) + value);
  }
  const items = [...totals]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, RANKING_LIMIT);
  return { id, items };
}

/** "2026-10-01" vira "2026-10": o mês é aproximado pela criação da proposta. */
function monthLabel(value: unknown): string {
  return String(value ?? "").slice(0, 7);
}

export function buildSupplierView(dashboard: AnalyticsDashboard): DashboardView {
  const offers = rows(dashboard, "kpi_supplier_offers_summary")[0];
  const stock = rows(dashboard, "kpi_supplier_stock_summary")[0];
  const proposals = rows(dashboard, "kpi_supplier_proposals_summary")[0];
  const months = new Map<string, number>();
  for (const row of rows(dashboard, "kpi_supplier_accepted_value_by_month")) {
    const label = monthLabel(row.proposal_created_month_proxy);
    const value = toNumber(row.accepted_negotiated_value);
    if (label && value !== null) months.set(label, (months.get(label) ?? 0) + value);
  }
  const ordered = [...months].sort(([a], [b]) => a.localeCompare(b));
  const metrics: DashboardMetric[] = [
    { id: "registeredOffers", value: field(offers, "registered_offers") },
    { id: "activeOffers", value: field(offers, "active_offers") },
    { id: "expiredOffers", value: field(offers, "expired_offers") },
    { id: "expiringOffers", value: field(offers, "offers_expiring_in_30_days") },
    { id: "stockUnits", value: field(stock, "stock_units") },
    { id: "modelsInStock", value: field(stock, "models_in_stock") },
    { id: "openProposals", value: field(proposals, "open_received_proposals") },
    { id: "acceptedProposals", value: field(proposals, "accepted_proposals") },
    { id: "acceptanceRate", value: field(proposals, "closed_acceptance_rate_pct"), unit: "%" },
    { id: "acceptedValue", value: field(proposals, "accepted_negotiated_value"), unit: "R$" },
  ];
  return {
    metrics,
    distributions: [
      distribution(dashboard, "offersByStatus", "kpi_supplier_offers_by_status", "commercial_status", "offer_count"),
      distribution(dashboard, "proposalsByStatus", "kpi_supplier_proposals_by_status", "proposal_status", "received_proposals"),
    ],
    series: [{ id: "acceptedValueByMonth", labels: ordered.map(([label]) => label), values: ordered.map(([, value]) => value) }],
    rankings: [
      ranking(dashboard, "acceptedValueByModel", "kpi_supplier_accepted_value_by_model", "model_name", "accepted_negotiated_value"),
      ranking(dashboard, "stockByModel", "kpi_supplier_stock_by_model", "model_name", "stock_units"),
    ],
  };
}

export function buildRequesterView(dashboard: AnalyticsDashboard): DashboardView {
  const summary = rows(dashboard, "kpi_requester_summary")[0];
  return {
    metrics: [
      { id: "localUnits", value: field(summary, "registered_local_units") },
      { id: "proposals", value: field(summary, "registered_proposals") },
      { id: "projects", value: field(summary, "registered_projects") },
    ],
    distributions: [
      distribution(dashboard, "proposalsByStatus", "kpi_requester_proposals_by_status", "proposal_status", "proposal_count"),
      distribution(dashboard, "projectsByStatus", "kpi_requester_projects_by_status", "project_status", "project_count"),
    ],
    series: [],
    rankings: [],
  };
}

export function buildPlatformView(dashboard: AnalyticsDashboard): DashboardView {
  const registrations = rows(dashboard, "kpi_admin_registrations")[0];
  return {
    metrics: [
      { id: "activeSuppliers", value: field(registrations, "active_suppliers") },
      { id: "registeredRequesters", value: field(registrations, "registered_requesters") },
    ],
    distributions: [
      distribution(dashboard, "modelsByStatus", "kpi_admin_models_by_status", "model_status", "model_count"),
      distribution(dashboard, "proposalsByStatus", "kpi_admin_proposals_by_status", "proposal_status", "proposal_count"),
    ],
    series: [],
    rankings: [],
  };
}

export function buildView(dashboard: AnalyticsDashboard): DashboardView {
  if (dashboard.scope === "SUPPLIER") return buildSupplierView(dashboard);
  if (dashboard.scope === "REQUESTER") return buildRequesterView(dashboard);
  return buildPlatformView(dashboard);
}

export function metricsWithValue(metrics: DashboardMetric[]): DashboardMetric[] {
  return metrics.filter((metric) => metric.value !== null);
}
