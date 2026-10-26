import Pagination from "@@/ui/pagination/Pagination";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Marketplace from "@/features/marketplace/Marketplace";
import { filterCompanies, getFeedView } from "@/features/marketplace/marketplace.utils";
import { useMarketplaceCatalog, useMarketplacePagination } from "@/features/marketplace/marketplace.hooks";
import MarketplaceLayout from "@/features/marketplace/components/MarketplaceLayout";
import MarketplaceHeading from "@/features/marketplace/components/MarketplaceHeading";
import MarketplaceResults from "@/features/marketplace/components/MarketplaceResults";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { getCatalogCompanies } from "../../company.service";
import CompanyFeaturedCard from "./CompanyFeaturedCard";
import CompanyCollections from "./CompanyCollections";

export default function CompanyFeed() {
  const { t } = useTranslation("marketplace");
  const { t: feed } = useTranslation("feed");
  const { lang: value } = useParams();
  const lang = isSupportedLanguage(value) ? value : DEFAULT;
  const [params] = useSearchParams();
  const { items, error, retry } = useMarketplaceCatalog(getCatalogCompanies);
  const filtered = filterCompanies(items ?? [], getFeedView("companies", params.get("view")));
  const paged = useMarketplacePagination(filtered, JSON.stringify([params.get("view"), lang]));
  const featured = paged.pagination.page === 1 && paged.items.length > 2 ? paged.items.slice(0, 2) : [];
  const rest = featured.length ? paged.items.slice(2) : paged.items;
  return (
    <MarketplaceLayout>
      <MarketplaceHeading title={t("companiesTitle")} description={t("companiesDescription")} centered>
        <ToolbarAction to={routePaths.searchCompanies(lang)} icon="search" label={t("searchCompanies")} content={t("searchCompanies")} />
      </MarketplaceHeading>
      <Marketplace category="companies" />
      <MarketplaceResults
        loading={!items && !error}
        error={error ? feed("company.loadError") : undefined}
        empty={items && !filtered.length ? feed("company.empty") : undefined}
        onRetry={retry}>
        {featured.length > 0 && <CompanyCollections companies={featured} lang={lang} />}
        <section className="flex flex-col gap-8">
          <h2 className="text-subtitle font-semi-bold">{t("partnersHeading")}</h2>
          <div className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((company) => (
              <CompanyFeaturedCard key={company.id} company={company} lang={lang} />
            ))}
          </div>
        </section>
        <Pagination {...paged.pagination} appearance="borderless" />
      </MarketplaceResults>
    </MarketplaceLayout>
  );
}
