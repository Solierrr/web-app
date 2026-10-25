import { useTranslation } from "react-i18next";
import type { CatalogCompany } from "../../company.service";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import CompanyFeaturedCard from "./CompanyFeaturedCard";

export default function CompanyCollections({ companies, lang }: { companies: CatalogCompany[]; lang: SupportedLanguage }) {
  const { t } = useTranslation("marketplace");
  return (
    <section className="grid min-w-0 grid-cols-1 gap-8 md:grid-cols-2" aria-label={t("companyFeatured")}>
      {companies.map((company) => (
        <CompanyFeaturedCard key={company.id} company={company} lang={lang} />
      ))}
    </section>
  );
}
