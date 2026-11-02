import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { filterCompanies, getFeedView } from "@/features/marketplace/marketplace.utils";
import { useMarketplaceCatalog } from "@/features/marketplace/marketplace.hooks";
import MarketplaceLayout from "@/features/marketplace/components/MarketplaceLayout";
import MarketplacePageHeader from "@/features/marketplace/components/MarketplacePageHeader";
import MarketplaceResults from "@/features/marketplace/components/MarketplaceResults";
import SurfaceGroup from "@@/ui/surface/SurfaceGroup";
import GroupAction from "@@/ui/button/GroupAction";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { getCatalogCompanies } from "../../company.service";
import CompanyFeaturedCard from "./CompanyFeaturedCard";

export default function CompanyFeed() {
  const { t } = useTranslation("marketplace");
  const { t: feed } = useTranslation("feed");
  const { lang: value } = useParams();
  const lang = isSupportedLanguage(value) ? value : DEFAULT;
  const [params] = useSearchParams();
  const { items, error, retry } = useMarketplaceCatalog(getCatalogCompanies);
  const filtered = filterCompanies(items ?? [], getFeedView("companies", params.get("view")));
  const start = useRef<HTMLElement>(null);
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const update = () => setShowTop(window.scrollY > 640);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <MarketplaceLayout ref={start}>
      <MarketplacePageHeader title={t("companiesTitle")} description={t("companiesDescription")} category="companies" />
      <MarketplaceResults
        loading={!items && !error}
        error={error ? feed("company.loadError") : undefined}
        empty={items && !filtered.length ? feed("company.empty") : undefined}
        onRetry={retry}
        skeleton="pairs">
        <section aria-label={t("partnersHeading")} className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 lg:gap-y-10">
          {filtered.map((company) => (
            <CompanyFeaturedCard key={company.id} company={company} lang={lang} />
          ))}
        </section>
      </MarketplaceResults>
      {showTop && (
        <SurfaceGroup direction="horizontal" className="fixed bottom-28 right-4 z-30 sm:bottom-6 sm:right-6">
          <GroupAction
            layout="icon"
            icon="arrowUp"
            label={t("companyGallery.backToTop")}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
              start.current?.focus({ preventScroll: true });
            }}
          />
        </SurfaceGroup>
      )}
    </MarketplaceLayout>
  );
}
