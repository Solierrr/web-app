import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Skeleton from "@@/feedback/skeleton/Skeleton";
import ToolbarAction from "@@/ui/button/ToolbarAction";

export default function MarketplaceResults({
  loading,
  error,
  empty,
  onRetry,
  children,
}: {
  loading: boolean;
  error?: string;
  empty?: string;
  onRetry: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation("marketplace");
  if (error)
    return (
      <div className="flex items-center gap-4">
        <p role="alert">{error}</p>
        <ToolbarAction icon="refresh" label={t("retry")} onClick={onRetry} />
      </div>
    );
  if (loading)
    return (
      <div aria-busy="true" className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex flex-col gap-5">
            <Skeleton height="16rem" className="rounded-surface" />
            <Skeleton height="1.5rem" width="75%" />
            <Skeleton height="1rem" width="55%" />
          </div>
        ))}
      </div>
    );
  if (empty)
    return (
      <p role="status" className="py-12 text-body text-operational-muted">
        {empty}
      </p>
    );
  return children;
}
