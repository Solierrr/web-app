import type { AnalyticsDashboard, DashboardMetric, DashboardRanking, DashboardSeries, DashboardView, KpiRow } from "./analytics";

const RANKING_LIMIT = 8;
const TABLE_LIMIT = 50;

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

/** Soma uma coluna em todas as linhas; nulo se nenhuma linha tem valor. */
function sum(dashboard: AnalyticsDashboard, table: string, column: string): number | null {
  const values = rows(dashboard, table)
    .map((row) => toNumber(row[column]))
    .filter((value): value is number => value !== null);
  return values.length ? values.reduce((total, value) => total + value, 0) : null;
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

function ranking(
  dashboard: AnalyticsDashboard,
  id: string,
  table: string,
  labelColumn: string,
  valueColumn: string,
  label: (raw: string) => string = (raw) => raw,
): DashboardRanking {
  const totals = new Map<string, number>();
  for (const row of rows(dashboard, table)) {
    const raw = String(row[labelColumn] ?? "");
    const value = toNumber(row[valueColumn]);
    if (raw && value !== null) totals.set(raw, (totals.get(raw) ?? 0) + value);
  }
  const items = [...totals]
    .map(([raw, value]) => ({ label: label(raw), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, RANKING_LIMIT);
  return { id, items };
}

/** Soma por rótulo e ordena o rótulo (datas ISO ordenam como texto). */
function timeSeries(
  dashboard: AnalyticsDashboard,
  id: string,
  table: string,
  labelColumn: string,
  valueColumn: string,
  size: number,
  unit?: string,
): DashboardSeries {
  const totals = new Map<string, number>();
  for (const row of rows(dashboard, table)) {
    const label = String(row[labelColumn] ?? "").slice(0, size);
    const value = toNumber(row[valueColumn]);
    if (label && value !== null) totals.set(label, (totals.get(label) ?? 0) + value);
  }
  const ordered = [...totals].sort(([a], [b]) => a.localeCompare(b));
  return { id, labels: ordered.map(([label]) => label), values: ordered.map(([, value]) => value), unit };
}

function supplierName(dashboard: AnalyticsDashboard): (id: string) => string {
  return (id) => dashboard.names?.[id] ?? id.slice(0, 8);
}

export function buildSupplierView(dashboard: AnalyticsDashboard): DashboardView {
  const offers = rows(dashboard, "kpi_supplier_offers_summary")[0];
  const stock = rows(dashboard, "kpi_supplier_stock_summary")[0];
  const proposals = rows(dashboard, "kpi_supplier_proposals_summary")[0];
  const metrics: DashboardMetric[] = [
    { id: "registeredOffers", value: field(offers, "registered_offers") },
    { id: "activeOffers", value: field(offers, "active_offers") },
    { id: "expiredOffers", value: field(offers, "expired_offers") },
    { id: "expiringOffers", value: field(offers, "offers_expiring_in_30_days") },
    { id: "avgListedPrice", value: field(offers, "avg_listed_price"), unit: "R$" },
    { id: "avgActiveListedPrice", value: field(offers, "avg_active_listed_price"), unit: "R$" },
    { id: "listedAvailability", value: field(offers, "listed_availability") },
    { id: "stockUnits", value: field(stock, "stock_units") },
    { id: "modelsInStock", value: field(stock, "models_in_stock") },
    { id: "openProposals", value: field(proposals, "open_received_proposals") },
    { id: "acceptedProposals", value: field(proposals, "accepted_proposals") },
    { id: "closedProposals", value: field(proposals, "closed_proposals") },
    { id: "acceptanceRate", value: field(proposals, "closed_acceptance_rate_pct"), unit: "%" },
    { id: "acceptedValue", value: field(proposals, "accepted_negotiated_value"), unit: "R$" },
  ];
  return {
    metrics,
    distributions: [
      distribution(dashboard, "offersByStatus", "kpi_supplier_offers_by_status", "commercial_status", "offer_count"),
      distribution(dashboard, "proposalsByStatus", "kpi_supplier_proposals_by_status", "proposal_status", "received_proposals"),
    ],
    series: [
      timeSeries(
        dashboard,
        "acceptedValueByMonth",
        "kpi_supplier_accepted_value_by_month",
        "proposal_created_month_proxy",
        "accepted_negotiated_value",
        7,
        "R$",
      ),
      timeSeries(dashboard, "acceptedOffersByDate", "kpi_supplier_accepted_offers_by_date", "proposal_created_date_proxy", "accepted_proposals", 10),
    ],
    rankings: [
      ranking(dashboard, "acceptedValueByModel", "kpi_supplier_accepted_value_by_model", "model_name", "accepted_negotiated_value"),
      ranking(dashboard, "stockByModel", "kpi_supplier_stock_by_model", "model_name", "stock_units"),
    ],
    tables: [
      {
        id: "offerDetails",
        columns: [
          { key: "brand_name", format: "text" },
          { key: "model_name", format: "text" },
          { key: "unit_price", format: "money" },
          { key: "availability", format: "number" },
          { key: "expires_at", format: "date" },
          { key: "commercial_status", format: "status" },
        ],
        rows: rows(dashboard, "kpi_supplier_offer_details").slice(0, TABLE_LIMIT),
      },
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
    tables: [],
  };
}

export function buildPlatformView(dashboard: AnalyticsDashboard): DashboardView {
  const registrations = rows(dashboard, "kpi_admin_registrations")[0];
  const name = supplierName(dashboard);
  return {
    metrics: [
      { id: "activeSuppliers", value: field(registrations, "active_suppliers") },
      { id: "registeredRequesters", value: field(registrations, "registered_requesters") },
      { id: "registeredOffers", value: sum(dashboard, "kpi_supplier_offers_summary", "registered_offers") },
      { id: "activeOffers", value: sum(dashboard, "kpi_supplier_offers_summary", "active_offers") },
      { id: "stockUnits", value: sum(dashboard, "kpi_supplier_stock_summary", "stock_units") },
      { id: "acceptedProposals", value: sum(dashboard, "kpi_supplier_proposals_summary", "accepted_proposals") },
      { id: "acceptedValue", value: sum(dashboard, "kpi_supplier_proposals_summary", "accepted_negotiated_value"), unit: "R$" },
      { id: "localUnits", value: sum(dashboard, "kpi_requester_summary", "registered_local_units") },
      { id: "projects", value: sum(dashboard, "kpi_requester_summary", "registered_projects") },
    ],
    distributions: [
      distribution(dashboard, "modelsByStatus", "kpi_admin_models_by_status", "model_status", "model_count"),
      distribution(dashboard, "proposalsByStatus", "kpi_admin_proposals_by_status", "proposal_status", "proposal_count"),
    ],
    series: [],
    rankings: [
      ranking(dashboard, "topSuppliersByAcceptedValue", "kpi_supplier_proposals_summary", "supplier_id", "accepted_negotiated_value", name),
      ranking(dashboard, "topSuppliersByActiveOffers", "kpi_supplier_offers_summary", "supplier_id", "active_offers", name),
      ranking(dashboard, "topSuppliersByStock", "kpi_supplier_stock_summary", "supplier_id", "stock_units", name),
    ],
    tables: [],
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
