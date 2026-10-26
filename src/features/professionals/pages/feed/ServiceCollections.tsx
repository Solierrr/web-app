import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Surface from "@@/ui/surface/Surface";
import Icon from "@@/ui/icon/Icon";
import { routePaths } from "@/config/i18n/paths";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";

export default function ServiceCollections({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("marketplace");
  const { t: search } = useTranslation("search");
  return (
    <section className="grid min-w-0 grid-cols-1 gap-8 md:grid-cols-2">
      <Link
        to={routePaths.searchProfessionals(lang)}
        className="group relative flex min-h-80 flex-col justify-end overflow-hidden rounded-surface bg-operational-ink p-8 focus-visible:outline-orange">
        <img src="/images/marketplace/professional-6.webp" alt="" className="absolute inset-0 h-full w-full object-cover object-[center_42%]" />
        <span className="absolute inset-0 bg-gradient-to-t from-operational-ink/90 to-transparent" />
        <h2 className="relative text-subtitle font-semi-bold leading-tight text-white">{t("serviceSpotlight")}</h2>
      </Link>
      <div className="grid min-w-0 gap-3">
        {(
          [
            ["install", "panels", "installation"],
            ["maintain", "settings", "maintenance"],
            ["inspect", "search", "inspection"],
          ] as const
        ).map(([key, icon, filter]) => (
          <Surface key={key} className="min-w-0" contentClassName="h-full">
            <Link
              to={`${routePaths.searchProfessionals(lang)}?q=${encodeURIComponent(search(`professional.filters.${filter}`))}`}
              className="flex h-full items-center gap-4 px-5 py-5 transition-colors hover:bg-operational-hover focus-visible:outline-orange">
              <Icon name={icon} size={24} className="shrink-0 text-orange" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-body font-semi-bold">{t(key)}</span>
                <span className="text-sidebar leading-5 text-operational-muted">{t(`${key}Description`)}</span>
              </div>
              <Icon name="chevronRight" size={16} className="shrink-0 text-operational-muted" />
            </Link>
          </Surface>
        ))}
      </div>
    </section>
  );
}
