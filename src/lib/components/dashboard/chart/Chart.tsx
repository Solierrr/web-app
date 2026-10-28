import { useEffect, useRef, useState } from "react";
import type { EChartsType } from "echarts/core";
import { useTranslation } from "react-i18next";
import type { CartesianPayload, DistributionPayload, DashboardNumberFormat } from "../dashboard.d";
import { formatDashboardValue, createDashboardColorOrder } from "../dashboard.utils";
import { chartOptions, chartTheme, type SparklinePattern } from "./chart.utils";

interface ChartProps extends DashboardNumberFormat {
  payload: CartesianPayload | DistributionPayload;
  kind: "line" | "area" | "bar" | "donut" | "sparkline";
  title: string;
  stacked?: boolean;
  pattern?: SparklinePattern;
}

export default function Chart({ payload, kind, title, stacked, pattern, locale, unit, maximumFractionDigits, monochromatic = false }: ChartProps) {
  const container = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<EChartsType | null>(null);
  const [failed, setFailed] = useState(false);
  const [colorOrder] = useState(createDashboardColorOrder);
  const { t } = useTranslation("saas", { keyPrefix: "dashboard.analytics" });
  const format = { locale, unit, maximumFractionDigits };

  useEffect(() => {
    let active = true;
    let observer: ResizeObserver | undefined;
    let instance: EChartsType | undefined;
    import("./chart.engine")
      .then(({ init }) => {
        if (!active || !container.current) return;
        instance = init(container.current, undefined, { renderer: "svg" });
        setChart(instance);
        observer = new ResizeObserver(() => instance?.resize());
        observer.observe(container.current);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
      observer?.disconnect();
      instance?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!chart || chart.isDisposed() || !container.current) return;
    const theme = chartTheme(container.current, monochromatic);
    const count = "items" in payload ? payload.items.length : payload.series.length;
    if (!monochromatic && count > 1) theme.colors = colorOrder.map((index) => theme.colors[index]);
    chart.setOption(chartOptions(payload, kind, theme, { locale, unit, maximumFractionDigits }, stacked, pattern), {
      notMerge: true,
    });
  }, [chart, payload, kind, locale, unit, maximumFractionDigits, stacked, pattern, monochromatic, colorOrder]);

  return (
    <div className={`min-w-0 ${kind === "sparkline" ? "mt-auto" : ""}`}>
      {failed && (
        <p role="alert" className="text-feedback-error">
          {t("chartError")}
        </p>
      )}
      <div ref={container} aria-hidden="true" className={`w-full text-body font-medium ${kind === "sparkline" ? "h-16" : "h-72"}`} />
      {kind !== "sparkline" && (
        <details className="mt-2 text-body text-operational-muted">
          <summary className="w-fit cursor-pointer rounded-small focus-visible:outline-2">{t("viewData")}</summary>
          <div className="mt-3 max-h-64 overflow-auto scrollbar-none">
            <table className="w-full text-left text-body">
              <caption className="sr-only">{title}</caption>
              <thead>
                <tr>
                  <th scope="col" className="py-2 font-semi-bold">
                    {t("category")}
                  </th>
                  {"series" in payload ? (
                    payload.series.map((series, index) => (
                      <th scope="col" className="px-3 py-2 font-semi-bold" key={index}>
                        {series.name}
                      </th>
                    ))
                  ) : (
                    <th scope="col" className="px-3 py-2 font-semi-bold">
                      {t("value")}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {"series" in payload
                  ? payload.labels.map((label, index) => (
                      <tr key={index}>
                        <th scope="row" className="py-2 font-medium">
                          {label}
                        </th>
                        {payload.series.map((series, seriesIndex) => (
                          <td className="px-3 py-2" key={seriesIndex}>
                            {series.values[index] !== null && Number.isFinite(series.values[index])
                              ? formatDashboardValue(series.values[index] as number, format)
                              : ""}
                          </td>
                        ))}
                      </tr>
                    ))
                  : payload.items.map((item, index) => (
                      <tr key={index}>
                        <th scope="row" className="py-2 font-medium">
                          {item.label}
                        </th>
                        <td className="px-3 py-2">{formatDashboardValue(item.value, format)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}
