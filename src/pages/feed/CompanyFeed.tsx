import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import EntityCorridor from "@@/layout/corridor/EntityCorridor";
import { getCompanies } from "@/features/companies/company.service";
import type { Company } from "@/features/companies/company";
import type { EntityCardItem } from "@@/layout/entityCard/EntityCard";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage, type SupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/routePaths";

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

export default function CompanyFeed() {
  const { t } = useTranslation("commons");
  const { t: tFeed } = useTranslation("feed");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const [items, setItems] = useState<Company[]>([]);

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
        <h1>{t("navbar.companies")}</h1>
        <p className="text-black/70">{tFeed("company.description")}</p>
      </div>

      <div className="flex w-fit flex-row gap-2 rounded-full bg-input-bg p-1">
        <Link to={routePaths.professionalsFeed(lang)} className="px-4 py-2 font-medium text-input-text">
          {t("navbar.professionals")}
        </Link>
        <Link to={routePaths.companiesFeed(lang)} className="rounded-full bg-white px-4 py-2 font-medium text-orange">
          {t("navbar.companies")}
        </Link>
      </div>

      <EntityCorridor title={t("navbar.companies")} items={items.map((company) => toCardItem(company, lang))} />
    </div>
  );
}
