import type { ReactNode, Ref } from "react";

export default function MarketplaceLayout({ children, ref }: { children: ReactNode; ref?: Ref<HTMLElement> }) {
  return (
    <main
      ref={ref}
      tabIndex={ref ? -1 : undefined}
      className="mx-auto flex w-full max-w-marketplace-page min-w-0 flex-col gap-12 px-5 pb-20 pt-10 outline-none sm:px-10 lg:gap-14 lg:px-18">
      {children}
    </main>
  );
}
