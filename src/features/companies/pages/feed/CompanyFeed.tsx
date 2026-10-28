import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Marketplace from "@/features/marketplace/Marketplace";
import { filterCompanies, getFeedView } from "@/features/marketplace/marketplace.utils";
import { useMarketplaceCatalog } from "@/features/marketplace/marketplace.hooks";
import MarketplaceHeading from "@/features/marketplace/components/MarketplaceHeading";
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
    <main ref={start} tabIndex={-1} className="mx-auto flex w-full max-w-marketplace-page min-w-0 flex-col gap-8 px-5 pb-4 pt-10 outline-none sm:px-10 sm:pt-12 lg:gap-10 lg:px-16 xl:px-20">
      <div className="flex flex-col items-center gap-6 sm:gap-8">
        <MarketplaceHeading title={t("companiesTitle")} description={t("companiesDescription")} centered />
        <Marketplace category="companies" />
      </div>
      <MarketplaceResults
        loading={!items && !error}
        error={error ? feed("company.loadError") : undefined}
        empty={items && !filtered.length ? feed("company.empty") : undefined}
        onRetry={retry}>
        <section aria-label={t("partnersHeading")} className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 lg:gap-y-10">
          {filtered.map((company) => (
            <CompanyFeaturedCard key={company.id} company={company} lang={lang} />
          ))}
        </section>
      </MarketplaceResults>
      {showTop && (
        <SurfaceGroup direction="horizontal" className="fixed bottom-28 right-4 z-30 sm:bottom-6 sm:right-6">
          <GroupAction layout="icon" icon="arrowUp" label={t("companyGallery.backToTop")} onClick={() => {
            window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
            start.current?.focus({ preventScroll: true });
          }} />
        </SurfaceGroup>
      )}
    </main>
  );
}
