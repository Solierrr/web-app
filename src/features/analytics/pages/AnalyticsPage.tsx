import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import type { AnalyticsScope, KpiResult } from "../analytics";
import { getCompanyKpis, getPlatformKpis } from "../analytics.service";
import { kpisToCsv } from "../analytics.utils";

export default function AnalyticsPage() {
  const { t } = useTranslation("commons", { keyPrefix: "analytics" });
  const { loading, kind, company, isPlatformAdmin, can = () => false } = useActiveContext();
  const [result, setResult] = useState<KpiResult | null>(null);
  const [error, setError] = useState(false);

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
  const companyId = company?.id;

  useEffect(() => {
    if (loading || !scope) return;
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
  }, [loading, scope, companyId]);

  function exportCsv() {
    if (!result) return;
    const rows = result.kpis.map((kpi) => ({ label: t(`kpi.${kpi.key}`), value: kpi.value }));
    const url = URL.createObjectURL(new Blob([kpisToCsv(rows, [t("csv.indicator"), t("csv.value")])], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "solaria-indicators.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <OperationalPage
      title={t("title")}
      description={scope ? t(`scope.${scope}`) : undefined}
      loading={loading || (scope !== null && !result && !error)}
      actions={
        result?.kpis.length ? (
          <button type="button" onClick={exportCsv} className="rounded-small border border-operational-border px-3 py-2">
            {t("exportCsv")}
          </button>
        ) : undefined
      }>
      {scope === null ? <p>{t("personal")}</p> : null}
      {error ? <p role="alert">{t("loadError")}</p> : null}
      {result ? (
        <>
          {result.failed ? <p role="alert">{t("partial")}</p> : null}
          {result.kpis.length ? (
            <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {result.kpis.map((kpi) => (
                <div key={kpi.key} className="rounded-small border border-operational-border bg-white p-4">
                  <dt className="text-sm text-operational-muted">{t(`kpi.${kpi.key}`)}</dt>
                  <dd className="mt-2 text-3xl font-semi-bold">{kpi.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p>{t("empty")}</p>
          )}
        </>
      ) : null}
    </OperationalPage>
  );
}
