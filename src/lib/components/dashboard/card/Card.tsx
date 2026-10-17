import { useTranslation } from "react-i18next";
import Surface from "@@/ui/surface/Surface";
import type { DashboardCardProps } from "../dashboard.d";

export default function DashboardCard({
  title,
  description,
  actions,
  loading,
  error,
  empty,
  emptyLabel,
  loadingLabel,
  className = "",
  compact = false,
  children,
}: DashboardCardProps) {
  const { t } = useTranslation("saas", { keyPrefix: "dashboard.analytics" });
  return (
    <Surface
      className={`min-w-0 [&>div]:h-full ${compact ? "p-0! rounded-hard [&>div]:rounded-hard shadow-none" : ""} ${className}`}>
      <section
        aria-label={title}
        aria-busy={loading || undefined}
        className={`flex h-full min-w-0 flex-col ${compact ? "min-h-36 gap-2" : "gap-4 p-5"}`}>
        <header className={`flex items-start justify-between gap-3 ${compact ? "px-4 pt-4" : ""}`}>
          <div className="min-w-0">
            <h2 className={`text-body leading-6 ${compact ? "font-medium text-operational-muted" : "font-semi-bold"}`}>{title}</h2>
            {description && <p className="mt-1 text-body text-operational-muted">{description}</p>}
          </div>
          {actions}
        </header>
        {loading ? (
          <div role="status" aria-label={loadingLabel ?? t("loading")} className="flex min-h-28 flex-1 flex-col justify-center gap-4">
            <span className="h-8 w-1/3 rounded-medium bg-skeleton animate-pulse motion-reduce:animate-none" />
            <span className="h-14 w-full rounded-medium bg-skeleton animate-pulse motion-reduce:animate-none" />
          </div>
        ) : error ? (
          <p role="alert" className="flex min-h-28 items-center text-feedback-error">
            {error}
          </p>
        ) : empty ? (
          <p role="status" className="flex min-h-28 items-center justify-center text-operational-muted">
            {emptyLabel ?? t("empty")}
          </p>
        ) : (
          children
        )}
      </section>
    </Surface>
  );
}
