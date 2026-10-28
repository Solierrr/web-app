import { useState } from "react";
import { Link } from "react-router-dom";
import { routePaths } from "@/config/i18n/paths";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import type { CatalogCompany } from "@/features/companies/company.service";
import MarketplaceImage from "@/features/marketplace/components/MarketplaceImage";

export default function CompanyFeaturedCard({ company, lang }: { company: CatalogCompany; lang: SupportedLanguage }) {
  const [failedLogo, setFailedLogo] = useState<string>();
  const location = [company.city, company.state].filter(Boolean).join(", ");
  return (
    <Link
      to={routePaths.companyProfile(lang, company.slug)}
      aria-label={company.tradeName}
      className="group flex min-w-0 flex-col gap-3 rounded-surface focus-visible:outline-orange">
      <div className="relative overflow-hidden rounded-surface bg-operational-surface">
        <MarketplaceImage src={company.bannerUrl} alt="" className="aspect-video [&_img]:transition-transform [&_img]:duration-500 group-hover:[&_img]:scale-105 motion-reduce:[&_img]:transform-none" />
      </div>
      <div className="flex items-center gap-3">
        <div
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center">
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
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="break-words text-body font-semi-bold leading-6 text-operational-ink transition-colors group-hover:text-orange">{company.tradeName}</h2>
          {location && <p className="text-sidebar leading-5 text-operational-muted">{location}</p>}
        </div>
      </div>
    </Link>
  );
}
