import type { ReactNode } from "react";

export interface DashboardCardProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  emptyLabel?: string;
  loadingLabel?: string;
  className?: string;
  compact?: boolean;
  children?: ReactNode;
}

export interface DashboardNumberFormat {
  monochromatic?: boolean;
  locale?: string;
  unit?: string;
  maximumFractionDigits?: number;
}

export interface ChartSeries {
  name: string;
  values: (number | null)[];
}

export interface CartesianPayload {
  labels: string[];
  series: ChartSeries[];
}

export interface DistributionPayload {
  items: { label: string; value: number }[];
}

export interface MetricPayload {
  value: number | null;
  context?: string;
  change?: { percent: number; favorable?: "increase" | "decrease" | "neutral"; label?: string };
  trend?: CartesianPayload;
}

export interface ChartProps extends Omit<DashboardCardProps, "children" | "empty">, DashboardNumberFormat {
  payload: CartesianPayload;
  stacked?: boolean;
}

export interface DistributionProps extends Omit<DashboardCardProps, "children" | "empty">, DashboardNumberFormat {
  payload: DistributionPayload;
}

export interface MetricProps extends Omit<DashboardCardProps, "children" | "empty">, DashboardNumberFormat {
  payload: MetricPayload;
  trendPosition?: "side" | "bottom";
}
