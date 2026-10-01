import { useTranslation } from "react-i18next";

export default function OperationalLoading() {
  const { t } = useTranslation("saas");

  return (
    <div role="status" aria-label={t("shell.loading")} className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-white">
      <div
        aria-hidden="true"
        className="flex h-12 w-40 items-center justify-center rounded-small border border-dashed border-operational-border text-operational-muted">
        {t("shell.brandPlaceholder")}
      </div>
      <div className="h-1 w-48 overflow-hidden rounded-full bg-operational-hover">
        <div className="h-full w-16 animate-operational-progress rounded-full bg-orange motion-reduce:animate-none" />
      </div>
      <span className="sr-only">{t("shell.loading")}</span>
    </div>
  );
}
