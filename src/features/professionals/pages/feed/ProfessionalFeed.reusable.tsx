import { useTranslation } from "react-i18next";
import installer from "@/assets/mocks/editorial/solar-panels-f6b647281b36.webp";
import inspection from "@/assets/mocks/editorial/solar-panels-ad6d474c9b41.webp";
import rooftop from "@/assets/mocks/editorial/solar-panels-0b1863beca2c.webp";
import HighlightBanner from "@/features/marketplace/components/HighlightBanner";
import { routePaths } from "@/config/i18n/paths";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import type { CatalogTechnician } from "../../professional.service";
import { groups, normalize } from "./ProfessionalFeed.utils";

const images = { installation: installer, maintenance: rooftop, inspection };

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
  return (
    <HighlightBanner
      image={images[format]}
      title={t(`${format}Title`)}
      description={t(`${format}Description`)}
      action={t(`${format}Action`)}
      to={target}
    />
  );
}
