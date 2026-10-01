import type { Kpi } from "./analytics";

export const ANALYTICS_PERMISSIONS = [
  "GET /api/offers/company/{companyId}",
  "GET /api/models",
  "GET /api/local-units/company/{companyId}",
  "GET /api/user-companies/company/{companyId}",
];

function escapeCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function guardFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

export function kpisToCsv(rows: { label: string; value: number }[], header: [string, string]): string {
  return [header, ...rows.map((row) => [guardFormula(row.label), String(row.value)])].map((line) => line.map(escapeCell).join(",")).join("\n");
}

export function countBy<T>(items: T[], predicate: (item: T) => boolean): number {
  return items.filter(predicate).length;
}

export function pickKpis(entries: [string, number | null][]): Kpi[] {
  return entries.flatMap(([key, value]) => (value === null ? [] : [{ key, value }]));
}
