import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@@/ui/icon/Icon";
import { routePaths } from "@/config/i18n/paths";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import type { CatalogCompany } from "@/features/companies/company.service";

interface CompanyFeaturedCardProps {
  company: CatalogCompany;
  lang: SupportedLanguage;
}

export default function CompanyFeaturedCard({ company, lang }: CompanyFeaturedCardProps) {
  const { t } = useTranslation("feed");
  const [bannerFailed, setBannerFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const location = [company.city, company.state].filter(Boolean).join(" / ");

  return (
    <Link
      to={routePaths.companyProfile(lang, company.slug)}
      aria-label={company.tradeName}
      className="group flex min-w-0 flex-col gap-4 rounded-hard focus-visible:outline-orange">
      <div className="relative aspect-[4/3] overflow-hidden rounded-hard bg-input-bg">
        {company.bannerUrl && !bannerFailed ? (
          <img
            src={company.bannerUrl}
            alt=""
            loading="lazy"
            onError={() => setBannerFailed(true)}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:transform-none"
          />
        ) : (
          <div aria-hidden="true" className="flex h-full items-center justify-center bg-gradient-to-br from-orange/20 via-orange/5 to-input-bg">
            <Icon name="building" size={64} color="currentColor" className="h-16 w-16 text-orange/50" />
          </div>
        )}
      </div>
      <div className="flex items-start gap-3">
        <div aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-input-bg">
          {company.logoUrl && !logoFailed ? (
            <img src={company.logoUrl} alt="" loading="lazy" onError={() => setLogoFailed(true)} className="h-full w-full object-cover" />
          ) : (
            <span className="font-semi-bold text-orange">{company.tradeName.slice(0, 1)}</span>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="break-words text-body font-semi-bold leading-6 transition-colors group-hover:text-orange">{company.tradeName}</h2>
          {company.activities?.length ? (
            <p className="text-body text-operational-muted">
              {company.activities.map((activity) => t(`company.activities.${activity}`)).join(" · ")}
            </p>
          ) : null}
          {location && <p className="text-body text-operational-muted">{location}</p>}
        </div>
      </div>
    </Link>
  );
}
