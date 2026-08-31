import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Select from "@@/ui/select/Select";
import EntityCard from "@@/layout/entityCard/EntityCard";
import { getCompanies } from "@/features/companies/company.service";
import type { Company } from "@/features/companies/company";
import type { EntityCardItem } from "@@/layout/entityCard/EntityCard";
import { DEFAULT_LANGUAGE, isSupportedLanguage, type SupportedLanguage } from "@/config/locales/languages";
import { routePaths } from "@/config/locales/routePaths";

const MOCK_IDS = ["company-1", "company-2", "company-3"];

function toCardItem(company: Company, lang: SupportedLanguage): EntityCardItem {
  return {
    id: company.id,
    name: company.tradeName,
    avatarUrl: company.logoUrl,
    subtitle: company.address ? `${company.address.city}/${company.address.state}` : undefined,
    href: routePaths.companyProfile(lang, company.slug),
  };
}

export default function CompanySearch() {
  const { t } = useTranslation("search");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const [items, setItems] = useState<Company[]>([]);

  const filterChips = Object.values(
    t("company.filters", { returnObjects: true }) as Record<string, string>,
  );

  useEffect(() => {
    let active = true;

    getCompanies(MOCK_IDS).then((result) => {
      if (active) setItems(result);
    });

    return () => { active = false; };
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1>{t("company.title")}</h1>
        <p className="text-black/70">{t("company.description")}</p>
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
