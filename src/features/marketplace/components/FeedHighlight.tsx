import editorialRoof from "@/assets/mocks/editorial/solar-panels-ad6d474c9b41.webp";
import editorialSunset from "@/assets/mocks/editorial/solar-panels-dc8178a8e3a2.webp";
import editorialInstaller from "@/assets/mocks/editorial/solar-panels-f6b647281b36.webp";
import editorialHouse from "@/assets/mocks/editorial/solar-panels-0b1863beca2c.webp";
import editorialGarden from "@/assets/mocks/editorial/solar-panels-09f4cb6ca1ac.webp";
import editorialCabins from "@/assets/mocks/editorial/solar-panels-fb77b2f1d456.webp";
import scaffold from "@/assets/mocks/banners/banners-838aa6f4c6fb.webp";
import solarField from "@/assets/mocks/banners/enterprises-banners-solar-cf7b97846545.webp";
import solarAerial from "@/assets/mocks/banners/enterprises-banners-solar-8c89bcc2ee0c.webp";
import solarRows from "@/assets/mocks/banners/enterprises-banners-solar-ad95d2c56434.webp";
import { useTranslation } from "react-i18next";
import { routePaths } from "@/config/i18n/paths";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import type { FeedBanner, FeedHighlightFormat } from "../marketplace.utils";
import Highlight from "./Highlight";

type TileProps = { lang: SupportedLanguage };

// Só imagens fixas e de exemplo: o destaque não mostra produto nenhum.
const banners: Record<FeedBanner, { image: string; to: (lang: SupportedLanguage) => string }> = {
  sunset: { image: editorialSunset, to: routePaths.searchSolarPanels },
  installer: { image: editorialInstaller, to: routePaths.professionalsFeed },
  house: { image: editorialHouse, to: routePaths.infrastructureFeed },
  garden: { image: editorialGarden, to: routePaths.companiesFeed },
  cabins: { image: editorialCabins, to: routePaths.searchSolarPanels },
  field: { image: solarField, to: routePaths.companiesFeed },
  aerial: { image: solarAerial, to: routePaths.companiesFeed },
  rows: { image: solarRows, to: routePaths.searchSolarPanels },
};

function SunTile({ lang }: TileProps) {
  const { t } = useTranslation("marketplace", { keyPrefix: "feed.highlights" });
  return <Highlight image={editorialSunset} title={t("sunTitle")} action={t("sunAction")} to={routePaths.searchSolarPanels(lang)} />;
}

function BaseTile({ lang }: TileProps) {
  const { t } = useTranslation("marketplace", { keyPrefix: "feed.highlights" });
  return <Highlight image={scaffold} title={t("baseTitle")} action={t("baseAction")} to={routePaths.infrastructureFeed(lang)} />;
}

function ProjectTile({ lang }: TileProps) {
  const { t } = useTranslation("marketplace", { keyPrefix: "feed.highlights" });
  return <Highlight image={editorialRoof} title={t("projectTitle")} action={t("projectAction")} to={routePaths.professionalsFeed(lang)} />;
}

function Banner({ variant, lang }: TileProps & { variant: FeedBanner }) {
  const { t } = useTranslation("marketplace", { keyPrefix: `feed.banners.${variant}` });
  const { image, to } = banners[variant];
  return <Highlight image={image} title={t("title")} description={t("description")} action={t("action")} to={to(lang)} size="wide" align="bottom" />;
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
