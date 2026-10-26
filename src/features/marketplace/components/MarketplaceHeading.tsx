import type { ReactNode } from "react";

export default function MarketplaceHeading({
  title,
  description,
  children,
  centered = false,
}: {
  title: string;
  description: string;
  children?: ReactNode;
  centered?: boolean;
}) {
  return (
    <header className={`flex flex-col gap-3 ${centered ? "items-center text-center" : ""}`}>
      <h1 className="max-w-operational-copy text-title font-bold leading-tight text-operational-ink">{title}</h1>
      <p className="max-w-operational-copy text-body text-operational-muted">{description}</p>
      {children && <div className="mt-3">{children}</div>}
    </header>
  );
}
