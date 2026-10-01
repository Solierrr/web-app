import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, MapPin } from "lucide-react";

import { routePaths } from "@/config/inter/paths";
import type { SupportedLanguage } from "@/config/inter/browser/languages";
import { slugNormalization } from "@/lib/utils/normalization.utils";
import type { CompanyFeedItem } from "./CompanyFeed.utils";

interface CompanyFeaturedCardProps {
  item: CompanyFeedItem;
  lang: SupportedLanguage;
  featured?: boolean;
  showFeaturedLabel?: boolean;
}

export default function CompanyFeaturedCard({ item, lang, featured = false, showFeaturedLabel = false }: CompanyFeaturedCardProps) {
  const { t } = useTranslation("feed");
  const [bannerFailed, setBannerFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const { company } = item;
  const location = company.address ? `${company.address.city}/${company.address.state}` : undefined;
  const href = routePaths.companyProfile(lang, company.slug || slugNormalization(company.tradeName));

  return (
    <Link
      to={href}
      className={`group flex h-full min-h-80 flex-col overflow-hidden rounded-hard border border-black/10 bg-white transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange ${featured ? "lg:row-span-2" : ""}`}>
      <div className={`relative overflow-hidden bg-input-bg ${featured ? "h-64 sm:h-80 lg:h-full lg:min-h-96" : "h-44"}`}>
        {item.bannerUrl && !bannerFailed && (
          <img
            src={item.bannerUrl}
            alt=""
            onError={() => setBannerFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {(!item.bannerUrl || bannerFailed) && (
          <div className="h-full w-full bg-gradient-to-br from-orange/25 via-orange/10 to-input-bg" aria-hidden="true" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 flex items-end gap-3 sm:bottom-5 sm:left-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-hard border-2 border-white bg-white sm:h-20 sm:w-20">
            {item.logoUrl && !logoFailed ? (
              <img src={item.logoUrl} alt="" onError={() => setLogoFailed(true)} className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-8 w-8 text-orange" aria-hidden="true" />
            )}
          </div>
          {showFeaturedLabel && (
            <span className="mb-1 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-black">{t("company.featuredLabel")}</span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold leading-tight group-hover:text-orange">{company.tradeName}</h2>
          {location && (
            <p className="flex items-center gap-1.5 text-sm text-input-text">
              <MapPin size={16} aria-hidden="true" />
              {location}
            </p>
          )}
        </div>
        {item.highlights.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-2">
            {item.highlights.map((highlight) => (
              <li key={highlight} className="rounded-full bg-input-bg px-3 py-1.5 text-xs font-medium text-black/70">
                {t(highlight)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
