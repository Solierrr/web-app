import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SurfaceGroup from "@@/ui/surface/SurfaceGroup";
import GroupAction from "@@/ui/button/GroupAction";
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
        <img src="/images/marketplace/professional-1.webp" alt="" className="absolute inset-0 h-full w-full object-cover object-top" />
        <span className="absolute inset-0 bg-gradient-to-t from-operational-ink/90 to-transparent" />
        <h2 className="relative text-subtitle font-semi-bold leading-tight text-white">{t("professionalsHeading")}</h2>
      </Link>
      <SurfaceGroup>
        {(
          [
            ["install", "panels", "installation"],
            ["maintain", "settings", "maintenance"],
            ["inspect", "search", "inspection"],
          ] as const
        ).map(([key, icon, filter]) => (
          <GroupAction
            key={key}
            icon={icon}
            label={t(key)}
            content={t(key)}
            detail={t(`${key}Description`)}
            to={`${routePaths.searchProfessionals(lang)}?q=${encodeURIComponent(search(`professional.filters.${filter}`))}`}
            className="flex-1 py-6!"
          />
        ))}
      </SurfaceGroup>
    </section>
  );
}
