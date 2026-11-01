import type { ReactNode } from "react";

// Título e subtítulo das páginas do marketplace. O subtítulo usa um nível acima do texto corrido (text-label), porque
// o título é bem maior (text-title) e, com o texto corrido, o par ficava desproporcional.
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
    <header className={`flex flex-col gap-4 ${centered ? "items-center text-center" : ""}`}>
      <h1 className="max-w-operational-copy text-title font-bold leading-tight tracking-tight text-operational-ink">{title}</h1>
      <p className="max-w-operational-copy text-label leading-relaxed text-operational-muted">{description}</p>
      {children && <div className="mt-3">{children}</div>}
    </header>
  );
}
