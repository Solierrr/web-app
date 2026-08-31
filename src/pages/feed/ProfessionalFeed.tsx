import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import EntityCorridor from "@@/layout/corridor/EntityCorridor";
import { getProfessionals } from "@/features/professionals/professional.service";
import type { Professional } from "@/features/professionals/professional";
import type { EntityCardItem } from "@@/layout/entityCard/EntityCard";
import { DEFAULT_LANGUAGE, isSupportedLanguage, type SupportedLanguage } from "@/config/locales/languages";
import { routePaths } from "@/config/locales/routePaths";

const MOCK_IDS = ["professional-1", "professional-2", "professional-3"];

function toCardItem(professional: Professional, lang: SupportedLanguage): EntityCardItem {
  return {
    id: professional.id,
    name: professional.name,
    avatarUrl: professional.avatar,
    subtitle: professional.registrations?.[0]?.profession,
    href: routePaths.professionalProfile(lang, professional.slug),
  };
}

export default function ProfessionalFeed() {
  const { t } = useTranslation("commons");
  const { t: tFeed } = useTranslation("feed");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const [items, setItems] = useState<Professional[]>([]);

  useEffect(() => {
    let active = true;

    getProfessionals(MOCK_IDS).then((result) => {
      if (active) setItems(result);
    });

    return () => { active = false; };
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1>{t("navbar.professionals")}</h1>
        <p className="text-black/70">{tFeed("professional.description")}</p>
      </div>

      <div className="flex w-fit flex-row gap-2 rounded-full bg-input-bg p-1">
        <Link to={routePaths.professionalsFeed(lang)} className="rounded-full bg-white px-4 py-2 font-medium text-orange">
          {t("navbar.professionals")}
        </Link>
        <Link to={routePaths.companiesFeed(lang)} className="px-4 py-2 font-medium text-input-text">
          {t("navbar.companies")}
        </Link>
      </div>

      <EntityCorridor title={t("navbar.professionals")} items={items.map((professional) => toCardItem(professional, lang))} />
    </div>
  );
}
