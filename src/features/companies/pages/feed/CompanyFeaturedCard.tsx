import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { routePaths } from "@/config/i18n/paths";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import type { CatalogCompany } from "@/features/companies/company.service";
import MarketplaceImage from "@/features/marketplace/components/MarketplaceImage";

export default function CompanyFeaturedCard({ company, lang }: { company: CatalogCompany; lang: SupportedLanguage }) {
  const { t } = useTranslation("feed");
  const [failedLogo, setFailedLogo] = useState<string>();
  const location = [company.city, company.state].filter(Boolean).join(" / ");
  return (
    <Link
      to={routePaths.companyProfile(lang, company.slug)}
      aria-label={company.tradeName}
      className="group flex min-w-0 flex-col gap-4 rounded-surface focus-visible:outline-orange">
      <MarketplaceImage src={company.bannerUrl} alt="" className="aspect-[16/9] rounded-surface" />
      <div className="flex items-start gap-3">
        <div
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-hard border border-operational-border bg-white p-2">
          {company.logoUrl && failedLogo !== company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt=""
              loading="lazy"
              onError={() => setFailedLogo(company.logoUrl)}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="font-semi-bold text-orange">{company.tradeName.slice(0, 1)}</span>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="break-words text-body font-semi-bold leading-6 transition-colors group-hover:text-orange">{company.tradeName}</h2>
          {company.activities?.length ? (
            <p className="text-sidebar leading-5 text-operational-muted">
              {company.activities.map((activity) => t(`company.activities.${activity}`)).join(" · ")}
            </p>
          ) : null}
          {location && <p className="text-sidebar leading-5 text-operational-muted">{location}</p>}
        </div>
      </div>
    </Link>
  );
}
