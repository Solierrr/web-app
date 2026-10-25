import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("marketplace");
  return (
    <header className={`flex flex-col gap-6 ${centered ? "items-center text-center" : ""}`}>
      <p className="text-body text-operational-muted">{t("marketplace")}</p>
      <h1 className="max-w-operational-copy text-title font-bold leading-tight text-operational-ink">{title}</h1>
      <p className="max-w-operational-copy text-body text-operational-muted">{description}</p>
      {children}
    </header>
  );
}
