import type { ReactNode } from "react";
import Skeleton from "@@/feedback/skeleton/Skeleton";
import LoadFailure from "@@/feedback/load-failure/LoadFailure";

// Duas linhas de cartões em qualquer largura; não tenta imitar a altura da página.
// shelves: 1, 2 ou 3 colunas (feeds em prateleira e buscas). pairs: 1 ou 2 colunas, como o grid de empresas e de equipes.
const layouts = {
  shelves: {
    grid: "grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3",
    count: 6,
    visible: (i: number) => (i >= 4 ? "hidden lg:flex" : i >= 2 ? "hidden sm:flex" : "flex"),
  },
  pairs: {
    grid: "grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 lg:gap-y-10",
    count: 4,
    visible: (i: number) => (i >= 2 ? "hidden md:flex" : "flex"),
  },
};

export default function MarketplaceResults({
  loading,
  error,
  empty,
  onRetry,
  skeleton = "shelves",
  children,
}: {
  loading: boolean;
  error?: string;
  empty?: string;
  onRetry: () => void;
  skeleton?: keyof typeof layouts;
  children: ReactNode;
}) {
  if (error) return <LoadFailure title={error} onRetry={onRetry} />;
  if (loading) {
    const layout = layouts[skeleton];
    return (
      <div aria-busy="true" className={`grid min-w-0 ${layout.grid}`}>
        {Array.from({ length: layout.count }, (_, i) => (
          <div key={i} className={`flex-col gap-4 ${layout.visible(i)}`}>
            <Skeleton height="16rem" className="rounded-surface" />
            <Skeleton height="1.5rem" width="75%" />
            <Skeleton height="1rem" width="55%" />
          </div>
        ))}
      </div>
    );
  }
  if (empty)
    return (
      <p role="status" className="py-12 text-body text-operational-muted">
        {empty}
      </p>
    );
  return children;
}
