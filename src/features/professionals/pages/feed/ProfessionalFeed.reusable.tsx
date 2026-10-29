import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@@/ui/icon/Icon";
import installer from "@/assets/mocks/editorial/solar-panels-f6b647281b36.webp";
import inspection from "@/assets/mocks/editorial/solar-panels-ad6d474c9b41.webp";
import rooftop from "@/assets/mocks/editorial/solar-panels-0b1863beca2c.webp";
import { routePaths } from "@/config/i18n/paths";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import type { CatalogTechnician } from "../../professional.service";
import { groups, normalize } from "./ProfessionalFeed.utils";

export function ServiceHighlight({
  format,
  professionals = [],
  lang,
}: {
  format: "installation" | "maintenance" | "inspection";
  professionals?: CatalogTechnician[];
  lang: SupportedLanguage;
}) {
  const { t } = useTranslation("marketplace", { keyPrefix: "serviceFeed" });
  const pattern = groups.find(([key]) => key === format)?.[1];
  const specialty = professionals.flatMap((person) => person.professions).find((profession) => pattern?.test(normalize(profession)));
  const target = routePaths.searchProfessionals(lang) + (specialty ? `?specialty=${encodeURIComponent(specialty)}` : "");
  const image = format === "installation" ? installer : format === "maintenance" ? rooftop : inspection;
  return (
    <Link
      to={target}
      className="group relative flex min-h-96 min-w-0 flex-col justify-end overflow-hidden rounded-surface bg-operational-ink p-6 focus-visible:outline-operational-ink sm:min-h-112 sm:p-12">
      <img
        src={image}
        alt=""
        loading="lazy"
        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-103 motion-reduce:transform-none"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-operational-ink/85 via-operational-ink/30 to-transparent transition-colors group-hover:bg-black/10" />
      <div className="relative flex max-w-lg flex-col items-start gap-5">
        <h2 className="text-title font-bold leading-tight tracking-tight text-white">{t(`${format}Title`)}</h2>
        {format === "installation" && <p className="text-body text-white/85">{t("installationDescription")}</p>}
        <span className="flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sidebar font-semi-bold text-operational-ink transition-colors group-hover:bg-operational-hover">
          {t(`${format}Action`)} <Icon name="chevronRight" size={18} color="currentColor" />
        </span>
      </div>
    </Link>
  );
}
