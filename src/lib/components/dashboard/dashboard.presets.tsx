import DashboardCard from "./card/Card";
import Surface from "@@/ui/surface/Surface";
import { useState } from "react";
import Chart from "./chart/Chart";
import type { SparklinePattern } from "./chart/chart.utils";
import type { ChartProps, DistributionProps, MetricProps } from "./dashboard.d";
import { formatDashboardValue, hasChartData, createDashboardColorOrder, dashboardPalette } from "./dashboard.utils";

function CartesianChart({
  kind,
  payload,
  stacked,
  locale,
  unit,
  maximumFractionDigits,
  monochromatic,
  ...card
}: ChartProps & { kind: "line" | "area" | "bar" }) {
  return (
    <DashboardCard {...card} empty={!hasChartData(payload)}>
      <Chart
        title={card.title}
        kind={kind}
        payload={payload}
        stacked={stacked}
        locale={locale}
        unit={unit}
        maximumFractionDigits={maximumFractionDigits}
        monochromatic={monochromatic}
      />
    </DashboardCard>
  );
}

export function LineChart(props: ChartProps) {
  return <CartesianChart {...props} kind="line" />;
}
export function AreaChart(props: ChartProps) {
  return <CartesianChart {...props} kind="area" />;
}
export function BarChart(props: ChartProps) {
  return <CartesianChart {...props} kind="bar" />;
}

export function DonutChart({ payload, locale, unit, maximumFractionDigits, monochromatic, ...card }: DistributionProps) {
  return (
    <DashboardCard {...card} empty={!payload.items.some((item) => Number.isFinite(item.value) && item.value > 0)}>
      <Chart
        title={card.title}
        kind="donut"
        payload={payload}
        locale={locale}
        unit={unit}
        maximumFractionDigits={maximumFractionDigits}
        monochromatic={monochromatic}
      />
    </DashboardCard>
  );
}

export function MetricCard({
  payload,
  locale,
  unit,
  maximumFractionDigits,
  monochromatic = true,
  compact = true,
  trendPosition = "side",
  ...card
}: MetricProps) {
  const change = payload.change;
  const favorable = change?.favorable ?? "neutral";
  const improving = change && (favorable === "increase" ? change.percent > 0 : change.percent < 0);
  const color =
    favorable === "neutral" || change?.percent === 0 ? "text-operational-muted" : improving ? "text-feedback-success" : "text-feedback-error";
  return (
    <DashboardCard {...card} compact={compact} empty={payload.value === null || !Number.isFinite(payload.value)}>
      <div className={`flex min-w-0 items-center justify-between gap-3 ${compact ? "px-4" : ""}`}>
        <div className="min-w-0">
          <p className="text-subtitle font-semi-bold tabular-nums leading-tight">
            {payload.value !== null && Number.isFinite(payload.value)
              ? formatDashboardValue(payload.value, { locale, unit, maximumFractionDigits })
              : ""}
          </p>
          {change && Number.isFinite(change.percent) && (
            <span className={`mt-1 inline-block text-body ${color}`}>
              {change.percent > 0 ? "↗" : change.percent < 0 ? "↘" : "→"} {formatDashboardValue(Math.abs(change.percent), { locale, unit: "%" })}
            </span>
          )}
        </div>
        {trendPosition === "side" && payload.trend && hasChartData(payload.trend) && (
          <div className="w-2/5 shrink-0">
            <Chart
              kind="sparkline"
              title={card.title}
              payload={payload.trend}
              locale={locale}
              unit={unit}
              maximumFractionDigits={maximumFractionDigits}
              monochromatic={monochromatic}
            />
          </div>
        )}
      </div>
      {(payload.context || change?.label) && (
        <p className={`mt-auto text-body text-operational-muted ${compact ? "px-4 pb-4" : ""}`}>{payload.context ?? change?.label}</p>
      )}
      {trendPosition === "bottom" && payload.trend && hasChartData(payload.trend) && (
        <Chart
          kind="sparkline"
          title={card.title}
          payload={payload.trend}
          locale={locale}
          unit={unit}
          maximumFractionDigits={maximumFractionDigits}
          monochromatic={monochromatic}
        />
      )}
    </DashboardCard>
  );
}

export function RankingCard({ payload, locale, unit, maximumFractionDigits, monochromatic = true, ...card }: DistributionProps) {
  const [colorOrder] = useState(createDashboardColorOrder);
  const items = payload.items
    .filter((item) => Number.isFinite(item.value) && item.value >= 0)
    .slice()
    .sort((a, b) => b.value - a.value);
  const max = items[0]?.value ?? 0;
  return (
    <DashboardCard {...card} empty={!items.length}>
      <ol className="flex flex-col gap-4">
        {items.map((item, index) => (
          <li key={index} className="min-w-0">
            <div className="mb-2 flex justify-between gap-3">
              <span className="min-w-0 break-words">{item.label}</span>
              <span className="shrink-0 tabular-nums">{formatDashboardValue(item.value, { locale, unit, maximumFractionDigits })}</span>
            </div>
            <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-input-bg">
              <div
                className="h-full rounded-full bg-orange"
                style={{
                  width: `${max > 0 ? (item.value / max) * 100 : 0}%`,
                  backgroundColor: monochromatic ? undefined : `var(--color-${dashboardPalette[colorOrder[index % colorOrder.length]]})`,
                }}
              />
            </div>
          </li>
        ))}
      </ol>
    </DashboardCard>
  );
}

const STRIP_PATTERNS: SparklinePattern[] = ["stripes", "dots", "cross"];
const STRIP_DIVIDER =
  "border-solid border-border [&>*:nth-child(even)]:border-l-(length:--border-width-ui) [&>*:nth-child(n+3)]:border-t-(length:--border-width-ui) xl:[&>*:nth-child(n+2)]:border-l-(length:--border-width-ui) xl:[&>*:nth-child(n+3)]:border-t-0";

function StripMetric({
  title,
  payload,
  locale,
  unit,
  maximumFractionDigits,
  monochromatic = true,
  pattern,
}: Pick<MetricProps, "title" | "payload" | "locale" | "unit" | "maximumFractionDigits" | "monochromatic"> & { pattern?: SparklinePattern }) {
  const change = payload.change;
  const favorable = change?.favorable ?? "neutral";
  const improving = change && (favorable === "increase" ? change.percent > 0 : change.percent < 0);
  const tone =
    favorable === "neutral" || change?.percent === 0
      ? "bg-operational-hover text-operational-muted"
      : improving
        ? "bg-feedback-success/10 text-feedback-success"
        : "bg-feedback-error/10 text-feedback-error";
  const hasValue = payload.value !== null && Number.isFinite(payload.value);
  return (
    <div className="flex min-w-0 flex-col gap-2 border-solid border-border p-5">
      <h3 className="text-sidebar font-medium text-operational-muted">{title}</h3>
      <div className="flex min-w-0 items-center justify-between gap-3">
        <p className="text-subtitle font-extra-bold tabular-nums leading-tight tracking-tight">
          {hasValue ? formatDashboardValue(payload.value as number, { locale, unit, maximumFractionDigits }) : "—"}
        </p>
        {payload.trend && hasChartData(payload.trend) && (
          <div className="w-2/5 shrink-0">
            <Chart
              kind="sparkline"
              title={title}
              payload={payload.trend}
              pattern={pattern}
              locale={locale}
              unit={unit}
              maximumFractionDigits={maximumFractionDigits}
              monochromatic={monochromatic}
            />
          </div>
        )}
      </div>
      {change && Number.isFinite(change.percent) ? (
        <p className="flex flex-wrap items-center gap-2 text-sidebar font-medium text-operational-muted">
          <span className={`rounded-full px-2.5 py-0.5 font-bold tabular-nums ${tone}`}>
            {change.percent > 0 ? "↗" : change.percent < 0 ? "↘" : "→"} {formatDashboardValue(Math.abs(change.percent), { locale, unit: "%" })}
          </span>
          {change.label}
        </p>
      ) : (
        payload.context && <p className="text-sidebar font-medium text-operational-muted">{payload.context}</p>
      )}
    </div>
  );
}

/**
 * MetricStrip
 *
 * Grupo de indicadores num único bloco, com divisórias finas entre eles, no mesmo formato dos KPIs dos relatórios:
 * rótulo, número em destaque (com tendência opcional), variação em pílula com a base de comparação e contexto.
 */
export function MetricStrip({
  label,
  metrics,
  className = "",
}: {
  label: string;
  metrics: (Pick<MetricProps, "title" | "payload" | "locale" | "unit" | "maximumFractionDigits" | "monochromatic"> & { id: string })[];
  className?: string;
}) {
  return (
    <Surface className={`min-w-0 ${className}`}>
      <section aria-label={label} className={`grid grid-cols-2 xl:grid-cols-4 ${STRIP_DIVIDER}`}>
        {metrics.map(({ id, ...metric }, index) => (
          <StripMetric key={id} pattern={STRIP_PATTERNS[index % STRIP_PATTERNS.length]} {...metric} />
        ))}
      </section>
    </Surface>
  );
}
