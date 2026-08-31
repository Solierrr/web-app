import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Select from "@@/ui/select/Select";
import EntityCard from "@@/layout/entityCard/EntityCard";
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

export default function ProfessionalSearch() {
  const { t } = useTranslation("search");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const [items, setItems] = useState<Professional[]>([]);

  const filterChips = Object.values(
    t("professional.filters", { returnObjects: true }) as Record<string, string>,
  );

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
        <h1>{t("professional.title")}</h1>
        <p className="text-black/70">{t("professional.description")}</p>
      </div>

      <div className="flex flex-row flex-wrap items-center gap-4">
        <Select
          name="filtrar-busca"
          placeholder={t("filterPlaceholder")}
          options={filterChips}
          className="min-w-60"
        />
        {filterChips.map((chip) => (
          <span
            key={chip}
            className="rounded-full bg-input-bg px-4 py-2 font-medium text-black/70"
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <EntityCard key={item.id} item={toCardItem(item, lang)} />
        ))}
      </div>
    </div>
  );
}
