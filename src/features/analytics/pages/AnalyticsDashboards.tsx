import { useTranslation } from "react-i18next";
import Dashboard from "@@/dashboard/Dashboard";
import { BarChart, DonutChart, MetricStrip, RankingCard } from "@@/dashboard/dashboard.presets";
import type { DashboardView } from "../analytics";
import { metricsWithValue } from "../analytics.dashboard";

const STRIP_SIZE = 4;

function chunk<T>(items: T[], size: number): T[][] {
  const groups: T[][] = [];
  for (let index = 0; index < items.length; index += size) groups.push(items.slice(index, index + size));
  return groups;
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
          unit="R$"
          className="md:col-span-6"
          payload={{ labels: series.labels, series: [{ name: t(`chart.${series.id}`), values: series.values }] }}
        />
      ))}
      {view.rankings.map((ranking) => (
        <RankingCard
          key={ranking.id}
          title={t(`chart.${ranking.id}`)}
          locale={locale}
          unit={ranking.id.startsWith("accepted") ? "R$" : undefined}
          className="md:col-span-6"
          payload={{ items: ranking.items }}
        />
      ))}
    </Dashboard>
  );
}
