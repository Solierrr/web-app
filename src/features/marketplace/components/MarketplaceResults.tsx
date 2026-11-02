import type { ReactNode } from "react";
import Skeleton from "@@/feedback/skeleton/Skeleton";
import LoadFailure from "@@/feedback/load-failure/LoadFailure";
import { skeletonKeys } from "@/lib/utils/skeleton.utils";

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
  if (error) return <LoadFailure title={error} onRetry={onRetry} />;
  if (loading)
    return (
      <div aria-busy="true" className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {skeletonKeys(4).map((key) => (
          <div key={key} className="flex flex-col gap-5">
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
