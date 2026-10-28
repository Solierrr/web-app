import type { ReactNode } from "react";

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-marketplace-page min-w-0 flex-col gap-12 px-5 pb-20 pt-10 sm:px-10 lg:gap-14 lg:px-18">
      {children}
    </main>
  );
}
