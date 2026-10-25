import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MarketplaceImage from "@/features/marketplace/components/MarketplaceImage";
import type { CatalogCompany } from "../../company.service";
import { routePaths } from "@/config/i18n/paths";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";

export default function CompanyCollections({ companies, lang }: { companies: CatalogCompany[]; lang: SupportedLanguage }) {
  const { t } = useTranslation("marketplace");
  return (
    <section className="grid min-w-0 gap-6 md:grid-cols-2" aria-label={t("companyFeatured")}>
      {companies.map((company, index) => (
        <Link
          key={company.id}
          to={routePaths.companyProfile(lang, company.slug)}
          className={`group relative flex min-h-80 flex-col justify-end overflow-hidden rounded-surface p-8 focus-visible:outline-orange ${index === 0 && company.bannerUrl ? "bg-operational-ink text-white" : "bg-orange/5 text-operational-ink"}`}>
          {index === 0 && company.bannerUrl ? (
            <>
              <MarketplaceImage src={company.bannerUrl} alt="" className="absolute inset-0 h-full w-full" />
              <span className="absolute inset-0 bg-gradient-to-t from-operational-ink/90 to-transparent" />
            </>
          ) : (
            <MarketplaceImage src={company.logoUrl} alt="" contain className="mb-8 h-24 w-24 rounded-surface bg-white" />
          )}
          <span className="relative text-body">{t("companyFeatured")}</span>
          <h2 className="relative mt-4 break-words text-subtitle font-semi-bold leading-tight">{company.tradeName}</h2>
          <p className="relative mt-5 flex items-center gap-3 text-body">
            {t("viewCompany")} <span aria-hidden="true">→</span>
          </p>
        </Link>
      ))}
    </section>
  );
}
