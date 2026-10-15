import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import SideCanvas from "@@/layout/access/canvas/SideCanvas";
import LogoLoader from "@@/feedback/logo-loader/LogoLoader";

interface OperationalPageProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  compact?: boolean;
  form?: boolean;
  formBackground?: boolean;
  sideBackground?: boolean;
  centered?: boolean;
  chat?: boolean;
  profile?: boolean;
  loading?: boolean;
  tabs?: boolean;
  navigation?: ReactNode;
  breadcrumbs?: ReactNode;
}

export default function OperationalPage({
  title,
  description,
  actions,
  children,
  compact = false,
  form = false,
  formBackground = false,
  sideBackground = false,
  centered = false,
  chat = false,
  profile = false,
  loading = false,
  tabs = false,
  navigation,
  breadcrumbs,
}: OperationalPageProps) {
  const { t } = useTranslation("saas");

  if (loading)
    return (
      <main aria-busy="true" className="operational-page flex min-h-full w-full items-center justify-center">
        <LogoLoader label={t("shell.loading")} />
      </main>
    );

  return (
    <main
      aria-busy={loading}
      className={`operational-page mx-auto flex w-full min-w-0 flex-col ${formBackground || sideBackground ? "relative isolate min-h-full max-w-none" : "max-w-operational-page"} ${chat ? "h-full min-h-0" : ""}`}>
      {(formBackground || sideBackground) && <SideCanvas centerWidth={formBackground ? "24rem" : "var(--spacing-operational-copy)"} />}
      {breadcrumbs && <div className="relative flex w-full justify-start px-4 pt-4 sm:px-8 lg:px-10">{breadcrumbs}</div>}
      <header
        className={`flex shrink-0 flex-col gap-4 px-4 pb-6 pt-8 sm:px-8 ${formBackground ? "mx-auto w-full max-w-120 text-center" : `lg:px-10 ${form ? "mx-auto w-full max-w-operational-form text-center" : ""}`}`}>
        <div className={`flex flex-wrap gap-4 ${centered ? "flex-col items-center text-center" : "items-start justify-between"}`}>
          <div className={`min-w-0 ${form ? "w-full" : ""}`}>
            <h1 className="text-operational-title font-semi-bold leading-8">{title}</h1>
            {description && <p className={`mt-2 max-w-operational-copy text-operational-muted ${centered ? "mx-auto" : ""}`}>{description}</p>}
          </div>
          {actions && <div className={`flex flex-wrap items-center gap-2 ${centered ? "justify-center" : ""}`}>{actions}</div>}
        </div>
        {tabs && navigation && (
          <nav aria-label={t("page.tabs")} className="flex gap-4 border-b border-operational-border">
            {navigation}
          </nav>
        )}
      </header>
      <div
        className={`flex min-w-0 flex-col gap-6 ${formBackground ? "mx-auto w-full max-w-120 px-4 pb-10 sm:px-12" : profile ? "" : "px-4 pb-8 sm:px-8 lg:px-10"} ${sideBackground && !formBackground ? "mx-auto w-full max-w-operational-page" : ""} ${compact && !form ? "mx-auto w-full max-w-operational-form" : ""} ${chat ? "min-h-0 flex-1" : ""}`}>
        {children}
      </div>
    </main>
  );
}
