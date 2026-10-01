import type { Kpi } from "./analytics";

function escapeCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

export function kpisToCsv(rows: { label: string; value: number }[], header: [string, string]): string {
  return [header, ...rows.map((row) => [row.label, String(row.value)])].map((line) => line.map(escapeCell).join(",")).join("\n");
}

export function countBy<T>(items: T[], predicate: (item: T) => boolean): number {
  return items.filter(predicate).length;
}

export function pickKpis(entries: [string, number | null][]): Kpi[] {
  return entries.flatMap(([key, value]) => (value === null ? [] : [{ key, value }]));
}
