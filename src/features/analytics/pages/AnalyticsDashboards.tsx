import { useTranslation } from "react-i18next";
import Dashboard from "@@/dashboard/Dashboard";
import DashboardCard from "@@/dashboard/card/Card";
import { BarChart, DonutChart, MetricStrip, RankingCard } from "@@/dashboard/dashboard.presets";
import type { DashboardTable, DashboardView, TableColumnFormat } from "../analytics";
import { metricsWithValue, toNumber } from "../analytics.dashboard";

const STRIP_SIZE = 4;

function chunk<T>(items: T[], size: number): T[][] {
  const groups: T[][] = [];
  for (let index = 0; index < items.length; index += size) groups.push(items.slice(index, index + size));
  return groups;
}

function formatCell(
  value: string | number | boolean | null | undefined,
  format: TableColumnFormat,
  locale: string | undefined,
  status: (key: string) => string,
  flag: (value: boolean) => string,
): string {
  if (value === null || value === undefined || value === "") return "-";
  if (format === "money") {
    const amount = toNumber(value);
    return amount === null ? "-" : new Intl.NumberFormat(locale, { style: "currency", currency: "BRL" }).format(amount);
  }
  if (format === "number") {
    const amount = toNumber(value);
    return amount === null ? "-" : new Intl.NumberFormat(locale).format(amount);
  }
  if (format === "date") {
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
  }
  if (format === "flag") return flag(value === true || value === "true");
  return format === "status" ? status(String(value)) : String(value);
}

function TableCard({ table, locale }: { table: DashboardTable; locale?: string }) {
  const { t } = useTranslation("commons", { keyPrefix: "analytics" });
  const status = (key: string) => t(`status.${key}`, { defaultValue: key });
  return (
    <DashboardCard title={t(`table.${table.id}`)} empty={!table.rows.length} className="col-span-full">
      <div className="max-h-96 overflow-auto">
        <table className="w-full min-w-max border-collapse text-left text-body">
          <thead>
            <tr>
              {table.columns.map((column) => (
                <th key={column.key} scope="col" className="sticky top-0 bg-surface px-3 py-2 font-medium text-operational-muted">
                  {t(`column.${column.key}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, index) => (
              <tr key={index} className="border-t border-border">
                {table.columns.map((column) => (
                  <td key={column.key} className={`px-3 py-2 ${column.format === "money" || column.format === "number" ? "tabular-nums" : ""}`}>
                    {formatCell(row[column.key], column.format, locale, status, (value) => t(value ? "flag.yes" : "flag.no"))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}

export default function AnalyticsDashboards({ view, locale }: { view: DashboardView; locale?: string }) {
  const { t } = useTranslation("commons", { keyPrefix: "analytics" });
  const metrics = metricsWithValue(view.metrics);
  const status = (key: string) => t(`status.${key}`, { defaultValue: key });
  return (
    <Dashboard className="w-full">
      {chunk(metrics, STRIP_SIZE).map((group, index) => (
        <MetricStrip
          key={group.map((metric) => metric.id).join("|")}
          label={`${t("title")} ${index + 1}`}
          className="col-span-full"
          metrics={group.map((metric) => ({
            id: metric.id,
            title: t(`metric.${metric.id}`),
            locale,
            unit: metric.unit,
            payload: { value: metric.value },
          }))}
        />
      ))}
      {view.distributions.map((distribution) => (
        <DonutChart
          key={distribution.id}
          title={t(`chart.${distribution.id}`)}
          locale={locale}
          className="md:col-span-6"
          payload={{ items: distribution.items.map((item) => ({ label: status(item.key), value: item.value })) }}
        />
      ))}
      {view.series.map((series) => (
        <BarChart
          key={series.id}
          title={t(`chart.${series.id}`)}
          description={t(`chartDescription.${series.id}`, { defaultValue: "" }) || undefined}
          locale={locale}
          unit={series.unit}
          className="md:col-span-6"
          payload={{ labels: series.labels, series: [{ name: t(`chart.${series.id}`), values: series.values }] }}
        />
      ))}
      {view.rankings.map((ranking) => (
        <RankingCard
          key={ranking.id}
          title={t(`chart.${ranking.id}`)}
          locale={locale}
          unit={/acceptedvalue/i.test(ranking.id) ? "R$" : undefined}
          className="md:col-span-6"
          payload={{ items: ranking.items }}
        />
      ))}
      {view.tables.map((table) => (
        <TableCard key={table.id} table={table} locale={locale} />
      ))}
    </Dashboard>
  );
}
