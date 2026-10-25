import Pagination from "@@/ui/pagination/Pagination";
import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Select from "@@/ui/select/Select";
import OfferCard from "@/features/marketplace/components/OfferCard";
import MarketplaceLayout from "@/features/marketplace/components/MarketplaceLayout";
import MarketplaceHeading from "@/features/marketplace/components/MarketplaceHeading";
import MarketplaceSearch from "@/features/marketplace/components/MarketplaceSearch";
import MarketplaceResults from "@/features/marketplace/components/MarketplaceResults";
import { useMarketplaceCatalog, useMarketplaceQuery, useMarketplacePagination } from "@/features/marketplace/marketplace.hooks";
import { matchesMarketplaceQuery } from "@/features/marketplace/marketplace.utils";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { getCatalogSolarPanels } from "../../solarPanel.service";

export default function SolarPanelSearch() {
  const { t } = useTranslation("marketplace");
  const { t: feed } = useTranslation("feed", { keyPrefix: "catalog" });
  const { lang: value } = useParams();
  const lang = isSupportedLanguage(value) ? value : DEFAULT;
  const load = useCallback(() => getCatalogSolarPanels(lang), [lang]);
  const { items, error, retry } = useMarketplaceCatalog(load);
  const [query, setQuery] = useMarketplaceQuery();
  const [type, setType] = useState("");
  const filtered = (items ?? []).filter(
    (item) =>
      (!type || (item.panel.productType ?? "PANEL") === type) &&
      matchesMarketplaceQuery(query, item.title, item.company.tradeName, item.panel.brand, item.panel.material),
  );
  const paged = useMarketplacePagination(filtered, JSON.stringify([query, type, lang]));
  return (
    <MarketplaceLayout>
      <MarketplaceHeading title={t("productsSearchTitle")} description={t("productsDescription")} centered />
      <MarketplaceSearch domain="products" lang={lang} query={query} onQueryChange={setQuery}>
        <Select
          clearable={false}
          name={t("products")}
          value={type}
          options={[
            [t("allProducts"), ""],
            [t("panels"), "PANEL"],
            [t("infrastructure"), "INFRASTRUCTURE"],
          ]}
          onChange={(value) => setType(value ?? "")}
        />
      </MarketplaceSearch>
      <section className="flex flex-col gap-8">
        <h2 className="text-label font-semi-bold">{t("results", { count: filtered.length })}</h2>
        <MarketplaceResults
          loading={!items && !error}
          error={error ? feed("failed") : undefined}
          empty={items && !filtered.length ? t("noResults") : undefined}
          onRetry={retry}>
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {paged.items.map((offer) => (
              <OfferCard key={offer.id} offer={offer} lang={lang} />
            ))}
          </div>
          <Pagination {...paged.pagination} appearance="borderless" />
        </MarketplaceResults>
      </section>
    </MarketplaceLayout>
  );
}
