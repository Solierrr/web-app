import editorialRoof from "@/assets/mocks/editorial/solar-panels-ad6d474c9b41.webp";
import editorialBase from "@/assets/mocks/editorial/infrastructure-d9a5baac44f0.webp";
import editorialSunset from "@/assets/mocks/editorial/solar-panels-dc8178a8e3a2.webp";
import editorialInstaller from "@/assets/mocks/editorial/solar-panels-f6b647281b36.webp";
import editorialHouse from "@/assets/mocks/editorial/solar-panels-0b1863beca2c.webp";
import editorialGarden from "@/assets/mocks/editorial/solar-panels-09f4cb6ca1ac.webp";
import editorialCabins from "@/assets/mocks/editorial/solar-panels-fb77b2f1d456.webp";
import panelCutout from "@/assets/mocks/products/solar-panels-f2b8091a5514.webp";
import solarField from "@/assets/mocks/banners/enterprises-banners-solar-cf7b97846545.webp";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import Icon from "@@/ui/icon/Icon";
import { routePaths } from "@/config/i18n/paths";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import type { FeedBanner, FeedHighlightFormat } from "../marketplace.utils";

type TileProps = { lang: SupportedLanguage };

const tile = "group relative flex min-h-80 flex-col overflow-hidden rounded-surface p-7 focus-visible:outline-orange sm:min-h-96";
const arrow = "absolute bottom-6 right-6 flex size-11 items-center justify-center rounded-full bg-white text-operational-ink";
const zoom = "transition-transform duration-500 group-hover:scale-103 motion-reduce:transform-none";

const banners: Record<FeedBanner, { image: string; to: (lang: SupportedLanguage) => string }> = {
  sunset: { image: editorialSunset, to: routePaths.searchSolarPanels },
  installer: { image: editorialInstaller, to: routePaths.professionalsFeed },
  house: { image: editorialHouse, to: routePaths.infrastructureFeed },
  garden: { image: editorialGarden, to: routePaths.companiesFeed },
  cabins: { image: editorialCabins, to: routePaths.searchSolarPanels },
  field: { image: solarField, to: routePaths.companiesFeed },
};

function SunTile({ lang }: TileProps) {
  const { t } = useTranslation("marketplace", { keyPrefix: "feed.highlights" });
  return (
    <Link to={routePaths.searchSolarPanels(lang)} className={`${tile} bg-orange/8`}>
      <h2 className="relative z-10 whitespace-pre-line text-title font-bold leading-none tracking-tight text-orange-copper">{t("sunTitle")}</h2>
      <img src={panelCutout} alt="" className={`absolute -right-2 bottom-14 h-3/5 w-3/5 rotate-12 object-contain mix-blend-multiply ${zoom}`} />
      <span className="absolute inset-x-7 bottom-6 flex items-center justify-between text-sidebar font-bold text-orange-copper">
        {t("sunAction")} <Icon name="chevronRight" size={18} color="currentColor" />
      </span>
    </Link>
  );
}

function BaseTile({ lang }: TileProps) {
  const { t } = useTranslation("marketplace", { keyPrefix: "feed.highlights" });
  return (
    <Link to={routePaths.infrastructureFeed(lang)} className={`${tile} bg-operational-surface`}>
      <img src={editorialBase} alt="" className={`absolute inset-0 h-full w-full object-contain px-5 pb-3 pt-16 mix-blend-multiply ${zoom}`} />
      <h2 className="relative whitespace-pre-line text-title font-bold leading-none tracking-tight text-operational-ink">{t("baseTitle")}</h2>
      <span className={`${arrow} bg-operational-ink! text-white`}>
        <Icon name="chevronRight" size={18} color="currentColor" />
      </span>
    </Link>
  );
}

function ProjectTile({ lang }: TileProps) {
  const { t } = useTranslation("marketplace", { keyPrefix: "feed.highlights" });
  return (
    <Link to={routePaths.professionalsFeed(lang)} className={`${tile} bg-operational-ink text-white`}>
      <img src={editorialRoof} alt="" className={`absolute inset-0 h-full w-full object-cover ${zoom}`} />
      <span className="absolute inset-0 bg-gradient-to-b from-operational-ink/40 to-transparent" />
      <h2 className="relative whitespace-pre-line text-title font-bold leading-none tracking-tight text-white">{t("projectTitle")}</h2>
      <span className={arrow}>
        <Icon name="chevronRight" size={18} color="currentColor" />
      </span>
    </Link>
  );
}

function Banner({ variant, lang }: TileProps & { variant: FeedBanner }) {
  const { t } = useTranslation("marketplace", { keyPrefix: `feed.banners.${variant}` });
  const navigate = useNavigate();
  const { image, to } = banners[variant];
  return (
    <section className="relative flex min-h-112 flex-col justify-end overflow-hidden rounded-surface bg-operational-ink p-8 sm:min-h-128 sm:p-12">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <span className="absolute inset-0 bg-gradient-to-t from-operational-ink/85 via-operational-ink/30 to-transparent" />
      <div className="relative flex max-w-xl flex-col items-start">
        <h2 className="whitespace-pre-line text-title font-bold leading-tight tracking-tight text-white">{t("title")}</h2>
        <p className="mt-3 text-label leading-snug text-white/85">{t("description")}</p>
        <PrimaryButton
          variant="soft"
          onClick={() => navigate(to(lang))}
          content={t("action")}
          description={t("action")}
          className="mt-6"
        />
      </div>
    </section>
  );
}

export default function FeedHighlight({ format, lang }: { format: FeedHighlightFormat; lang: SupportedLanguage }) {
  if (format === "collections")
    return (
      <section className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-3">
        <SunTile lang={lang} />
        <BaseTile lang={lang} />
        <ProjectTile lang={lang} />
      </section>
    );
  if (format === "pair")
    return (
      <section className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-[1fr_1.4fr]">
        <SunTile lang={lang} />
        <ProjectTile lang={lang} />
      </section>
    );
  return <Banner variant={format} lang={lang} />;
}
