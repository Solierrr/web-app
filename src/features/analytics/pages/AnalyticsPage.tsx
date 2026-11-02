import ToolbarAction from "@@/ui/button/ToolbarAction";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import Select from "@@/ui/select/Select";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Company } from "@/features/companies/company";
import { listAllCompanies } from "@/features/companies/company.service";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import type { AnalyticsDashboard } from "../analytics";
import { buildView, metricsWithValue } from "../analytics.dashboard";
import { getCompanyDashboard, getPlatformDashboard } from "../analytics.service";
import { kpisToCsv } from "../analytics.utils";
import AnalyticsDashboards from "./AnalyticsDashboards";

type Mode = "platform" | "company";

export default function AnalyticsPage() {
  const { loading, kind, company, isPlatformAdmin } = useActiveContext();
  const mode: Mode | null = kind === "company" && company ? "company" : isPlatformAdmin ? "platform" : null;
  return loading ? <OperationalLoading /> : <AnalyticsContent key={`${mode}:${company?.id}`} mode={mode} company={company} />;
}

function OperationalLoading() {
  const { t } = useTranslation("commons", { keyPrefix: "analytics" });
  return <OperationalPage title={t("title")} loading />;
}

function scopeKey(dashboard: AnalyticsDashboard | null, mode: Mode | null, company: Company | null): string | null {
  if (dashboard?.scope === "SUPPLIER") return "supplier";
  if (dashboard?.scope === "REQUESTER") return "demandant";
  if (dashboard?.scope === "PLATFORM") return "platform";
  if (mode === "company") return company?.type === "SUPPLIER" ? "supplier" : "demandant";
  return mode;
}

function AnalyticsContent({ mode, company }: { mode: Mode | null; company: Company | null }) {
  const { t, i18n } = useTranslation("commons", { keyPrefix: "analytics" });
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [error, setError] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selected, setSelected] = useState<Company | null>(null);
  const locale = i18n.resolvedLanguage;

  useEffect(() => {
    if (mode !== "platform") return;
    let active = true;
    listAllCompanies()
      .then((items) => {
        if (active) setCompanies(items.filter((item) => item.type === "SUPPLIER" || item.type === "DEMANDANT"));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [mode]);

  useEffect(() => {
    if (!mode) return;
    let active = true;
    const target = mode === "company" ? company : selected;
    const request = target ? getCompanyDashboard(target.id, target.type) : getPlatformDashboard();
    request
      .then((value) => {
        if (active) {
          setDashboard(value);
          setError(false);
        }
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [mode, company, selected]);

  const view = useMemo(() => (dashboard ? buildView(dashboard) : null), [dashboard]);
  const scope = scopeKey(dashboard, mode, company);
  const loadedAt = dashboard?.loadedAt ? new Date(dashboard.loadedAt) : null;
  const metrics = view ? metricsWithValue(view.metrics) : [];

  function exportCsv() {
    const rows = metrics.map((metric) => ({ label: t(`metric.${metric.id}`), value: metric.value ?? 0 }));
    const url = URL.createObjectURL(new Blob([kpisToCsv(rows, [t("csv.indicator"), t("csv.value")])], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "solaria-indicators.csv";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <OperationalPage
      centered
      sideBackground
      title={t("title")}
      description={scope ? t(`scope.${scope}`) : undefined}
      loading={mode !== null && !dashboard && !error}
      actions={
        metrics.length ? (
          <ToolbarAction
            icon="document"
            label={t("exportCsv")}
            content={t("exportCsv")}
            onClick={exportCsv}
            backgroundColor="var(--color-input-bg)"
          />
        ) : undefined
      }>
      {mode === null ? <p>{t("personal")}</p> : null}
      {mode === "platform" ? (
        <Select
          name={t("company")}
          value={selected?.id}
          onChange={(value) => {
            setDashboard(null);
            setSelected(companies.find((item) => item.id === value) ?? null);
          }}
          clearable
          placeholder={t("platformOption")}
          options={companies.map((item) => [item.tradeName ?? item.id, item.id] as [string, string])}
          className="w-full max-w-md"
        />
      ) : null}
      {error ? <p role="alert">{t("loadError")}</p> : null}
      {view && !error ? (
        <>
          {loadedAt ? (
            <p className="text-operational-muted">
              {t("loadedAt", { date: new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(loadedAt) })}
            </p>
          ) : null}
          {metrics.length || view.distributions.some((item) => item.items.length) ? (
            <AnalyticsDashboards view={view} locale={locale} />
          ) : (
            <p>{t("empty")}</p>
          )}
        </>
      ) : null}
    </OperationalPage>
  );
}
