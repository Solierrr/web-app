import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface OperationalPageProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  compact?: boolean;
  chat?: boolean;
  profile?: boolean;
  loading?: boolean;
  tabs?: boolean;
  navigation?: ReactNode;
}

export default function OperationalPage({
  title,
  description,
  actions,
  children,
  compact = false,
  chat = false,
  profile = false,
  loading = false,
  tabs = false,
  navigation,
}: OperationalPageProps) {
  const { t } = useTranslation("saas");

  return (
    <main
      aria-busy={loading}
      className={`operational-page mx-auto flex w-full min-w-0 flex-col max-w-operational-page ${chat ? "h-full min-h-0" : ""}`}>
      <header className="flex shrink-0 flex-col gap-4 px-4 pb-6 pt-8 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-operational-title font-semi-bold leading-8">{title}</h1>
            {description && <p className="mt-2 max-w-operational-copy text-operational-muted">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
        {tabs && navigation && (
          <nav aria-label={t("page.tabs")} className="flex gap-4 border-b border-operational-border">
            {navigation}
          </nav>
        )}
      </header>
      <div
        className={`flex min-w-0 flex-col gap-6 ${profile ? "" : "px-4 pb-8 sm:px-8 lg:px-10"} ${compact ? "max-w-operational-form" : ""} ${chat ? "min-h-0 flex-1" : ""}`}>
        {loading ? (
          <div role="status" className="flex flex-col gap-4">
            <span className="text-operational-muted">{t("shell.loading")}</span>
            <div className="h-4 w-48 rounded-small bg-operational-hover motion-safe:animate-pulse" />
            <div className="h-24 rounded-small border border-operational-border bg-white" />
          </div>
        ) : (
          children
        )}
      </div>
    </main>
  );
}
