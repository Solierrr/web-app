import type { ReactNode } from "react";
import Skeleton from "@@/feedback/skeleton/Skeleton";
import LoadFailure from "@@/feedback/load-failure/LoadFailure";

// Duas linhas de cartões em qualquer largura (1, 2 ou 3 colunas); não tenta imitar a altura da página.
const placeholders = 6;

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
      <div aria-busy="true" className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: placeholders }, (_, i) => (
          <div key={i} className={`flex-col gap-4 ${i >= 4 ? "hidden lg:flex" : i >= 2 ? "hidden sm:flex" : "flex"}`}>
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
