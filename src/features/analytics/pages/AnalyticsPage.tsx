import ToolbarAction from "@@/ui/button/ToolbarAction";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Company } from "@/features/companies/company";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import type { AnalyticsScope, KpiResult } from "../analytics";
import { getCompanyKpis, getPlatformKpis } from "../analytics.service";
import { ANALYTICS_PERMISSIONS, kpisToCsv } from "../analytics.utils";
import Dashboard from "@@/dashboard/Dashboard";
import { MetricCard } from "@@/dashboard/dashboard.presets";

interface ContentProps {
  scope: AnalyticsScope | null;
  company: Company | null;
  can: (permission: string) => boolean;
}

export default function AnalyticsPage() {
  const { loading, kind, company, isPlatformAdmin, can = () => false } = useActiveContext();
  const scope: AnalyticsScope | null =
    kind === "company" && company
      ? company.type === "SUPPLIER"
        ? "supplier"
        : company.type === "DEMANDANT"
          ? "demandant"
          : null
      : isPlatformAdmin
        ? "platform"
        : null;
  const key = `${scope}:${company?.id}:${ANALYTICS_PERMISSIONS.filter(can).join("|")}`;

  return loading ? <OperationalLoading /> : <AnalyticsContent key={key} scope={scope} company={company} can={can} />;
}

function OperationalLoading() {
  const { t } = useTranslation("commons", { keyPrefix: "analytics" });
  return <OperationalPage title={t("title")} loading />;
}

function AnalyticsContent({ scope, company, can }: ContentProps) {
  const { t, i18n } = useTranslation("commons", { keyPrefix: "analytics" });
  const [result, setResult] = useState<KpiResult | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!scope) return;
    let active = true;
    const request = scope === "platform" || !company ? getPlatformKpis() : getCompanyKpis(company, can);
    request
      .then((value) => {
        if (active) setResult(value);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  function exportCsv() {
    if (!result) return;
    const rows = result.kpis.map((kpi) => ({ label: t(`kpi.${kpi.key}`), value: kpi.value }));
    const url = URL.createObjectURL(new Blob([kpisToCsv(rows, [t("csv.indicator"), t("csv.value")])], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "solaria-indicators.csv";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  const allFailed = Boolean(result?.failed) && !result?.kpis.length;

  return (
    <OperationalPage
      centered
      sideBackground
      title={t("title")}
      description={scope ? t(`scope.${scope}`) : undefined}
      loading={scope !== null && !result && !error}
      actions={
        result?.kpis.length ? (
          <ToolbarAction
            icon="document"
            label={t("exportCsv")}
            content={t("exportCsv")}
            onClick={exportCsv}
            backgroundColor="var(--color-input-bg)"
          />
        ) : undefined
      }>
      {scope === null ? <p>{t("personal")}</p> : null}
      {error || allFailed ? <p role="alert">{t("loadError")}</p> : null}
      {result && !allFailed ? (
        <>
          {result.failed ? <p role="alert">{t("partial")}</p> : null}
          {result.kpis.length ? (
            <Dashboard className="mx-auto w-full lg:w-[85%]">
              {result.kpis.map((kpi) => (
                <MetricCard
                  key={kpi.key}
                  title={t(`kpi.${kpi.key}`)}
                  locale={i18n.resolvedLanguage}
                  payload={{ value: kpi.value }}
                  className="md:col-span-3 xl:col-span-4"
                />
              ))}
            </Dashboard>
          ) : (
            <p>{t("empty")}</p>
          )}
        </>
      ) : null}
    </OperationalPage>
  );
}
