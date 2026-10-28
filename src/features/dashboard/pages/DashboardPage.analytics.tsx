import { useState } from "react";
import { useTranslation } from "react-i18next";
import Dashboard from "@@/dashboard/Dashboard";
import { MetricStrip, AreaChart, BarChart, DonutChart, RankingCard } from "@@/dashboard/dashboard.presets";
import Select from "@@/ui/select/Select";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import { getDashboardMock } from "../dashboard.d.mocks";

export default function DashboardAnalytics() {
  const { t, i18n } = useTranslation("saas", { keyPrefix: "dashboard.analytics" });
  const [days, setDays] = useState(7);
  // Synthetic analytics remain available to isolated fixtures only.
  if (!isAlwaysMockMode()) return null;
  const data = getDashboardMock(days);
  const locale = i18n.resolvedLanguage;
  return (
    <section aria-label={t("title")} className="flex min-w-0 flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-label font-semi-bold">{t("title")}</h2>
          <p className="mt-2 text-operational-muted">{t("demo")}</p>
        </div>
        <Select
          name={t("period")}
          value={days}
          onChange={(value) => value && setDays(value)}
          clearable={false}
          options={[
            [t("week"), 7],
            [t("month"), 30],
          ]}
          className="min-w-48"
        />
      </header>
      <Dashboard>
        <MetricStrip
          label={t("title")}
          className="col-span-full"
          metrics={[
            {
              id: "views",
              title: t("views"),
              locale,
              payload: {
                value: data.totals.views,
                change: { percent: data.changes.views, favorable: "increase", label: t("comparison", { count: days }) },
                trend: { labels: data.labels, series: [{ name: t("views"), values: data.views }] },
              },
            },
            {
              id: "contacts",
              title: t("contacts"),
              locale,
              payload: {
                value: data.totals.contacts,
                change: { percent: data.changes.contacts, favorable: "increase", label: t("comparison", { count: days }) },
                trend: { labels: data.labels, series: [{ name: t("contacts"), values: data.contacts }] },
              },
            },
            { id: "offers", title: t("offers"), locale, payload: { value: data.totals.offers, context: t("offersContext") } },
            { id: "requests", title: t("requests"), locale, payload: { value: data.totals.requests, context: t("requestsContext") } },
          ]}
        />
        <AreaChart
          title={t("activity")}
          description={t("daily")}
          locale={locale}
          className="md:col-span-6"
          payload={{
            labels: data.labels,
            series: [
              { name: t("views"), values: data.views },
              { name: t("contacts"), values: data.contacts },
            ],
          }}
        />
        <DonutChart
          title={t("distribution")}
          locale={locale}
          unit="%"
          className="md:col-span-6"
          payload={{ items: ["panels", "services", "companies"].map((key, index) => ({ label: t(key), value: data.categories[index] })) }}
        />
        <BarChart
          title={t("power")}
          locale={locale}
          className="md:col-span-6"
          payload={{ labels: ["400–449 W", "450–499 W", "500–549 W", "550–599 W", "600+ W"], series: [{ name: t("models"), values: data.power }] }}
        />
        <RankingCard
          title={t("popular")}
          locale={locale}
          className="md:col-span-6"
          payload={{
            items: ["installation", "maintenance", "inspection", "design"].map((key, index) => ({ label: t(key), value: data.ranking[index] })),
          }}
        />
      </Dashboard>
    </section>
  );
}
