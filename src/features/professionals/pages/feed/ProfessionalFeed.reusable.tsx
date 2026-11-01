import { useTranslation } from "react-i18next";
import installer from "@/assets/mocks/editorial/solar-panels-f6b647281b36.webp";
import inspection from "@/assets/mocks/editorial/solar-panels-ad6d474c9b41.webp";
import roofWork from "@/assets/mocks/banners/enterprises-banners-6509b88d03f1.webp";
import engineering from "@/assets/mocks/banners/banners-7978f3e7ccff.webp";
import team from "@/assets/mocks/banners/banners-f44c80b35f0b.webp";
import Highlight from "@/features/marketplace/components/Highlight";
import { routePaths } from "@/config/i18n/paths";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import type { CatalogTechnician } from "../../professional.service";
import { groups, normalize } from "./ProfessionalFeed.utils";

const images = { installation: installer, maintenance: roofWork, inspection, engineering, team };

export function ServiceHighlight({
  format,
  professionals = [],
  lang,
}: {
  format: "installation" | "maintenance" | "inspection" | "engineering" | "team";
  professionals?: CatalogTechnician[];
  lang: SupportedLanguage;
}) {
  const { t } = useTranslation("marketplace", { keyPrefix: "serviceFeed" });
  const pattern = groups.find(([key]) => key === format)?.[1];
  const specialty = professionals.flatMap((person) => person.professions).find((profession) => pattern?.test(normalize(profession)));
  const target =
    format === "team"
      ? routePaths.professionalsFeed(lang) + "?view=teams"
      : routePaths.searchProfessionals(lang) + (specialty ? `?specialty=${encodeURIComponent(specialty)}` : "");
  return (
    <Highlight
      image={images[format]}
      title={t(`${format}Title`)}
      description={t(`${format}Description`)}
      action={t(`${format}Action`)}
      to={target}
      size="wide"
      align="bottom"
    />
  );
}
