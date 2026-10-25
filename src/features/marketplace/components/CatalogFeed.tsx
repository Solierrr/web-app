import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SearchBar from "@@/ui/search-bar/SearchBar";
import Select from "@@/ui/select/Select";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import Pagination from "@@/ui/pagination/Pagination";
import Surface from "@@/ui/surface/Surface";
import Marketplace from "../Marketplace";
import { matchesMarketplaceQuery, sortOffers } from "../marketplace.utils";
import OfferCard from "./OfferCard";
import MarketplaceLayout from "./MarketplaceLayout";
import MarketplaceHeading from "./MarketplaceHeading";
import MarketplaceResults from "./MarketplaceResults";
import ProductSpotlight from "./ProductSpotlight";
import { routePaths } from "@/config/i18n/paths";
import type { SolarPanelAnnouncement } from "@/features/solar-panel/solarPanel.announcement";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";

export default function CatalogFeed({
  kind,
  lang,
  load,
}: {
  kind?: "PANEL" | "INFRASTRUCTURE";
  lang: SupportedLanguage;
  load: (lang: SupportedLanguage) => Promise<SolarPanelAnnouncement[]>;
}) {
  const { t } = useTranslation("feed", { keyPrefix: "catalog" });
  const { t: market } = useTranslation("marketplace");
  const [params] = useSearchParams();
  const [items, setItems] = useState<SolarPanelAnnouncement[] | null>(null);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  const [query, setQuery] = useState("");
  const [supplier, setSupplier] = useState<string>();
  const [type, setType] = useState<string>();
  const [productType, setProductType] = useState("");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => {
    let active = true;
    load(lang)
      .then((data) => {
        if (active) {
          setItems(data.filter((item) => !kind || (item.panel.productType ?? "PANEL") === kind));
          setError(false);
        }
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [lang, load, kind, revision]);
  const view = params.get("view") === "trending" ? "trending" : "recent";
  const filtered = sortOffers(
    (items ?? []).filter(
      (item) =>
        (!supplier || item.company.id === supplier) &&
        (!productType || (item.panel.productType ?? "PANEL") === productType) &&
        (!type || item.panel.infrastructureType === type) &&
        matchesMarketplaceQuery(query, item.title, item.company.tradeName, item.panel.brand, item.panel.material),
    ),
    view,
  );
  const suppliers = [...new Map((items ?? []).map((item) => [item.company.id, item.company.tradeName])).entries()];
  const types = [...new Set((items ?? []).flatMap((item) => (item.panel.infrastructureType ? [item.panel.infrastructureType] : [])))];
  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / 12)));
  function refresh() {
    setItems(null);
    setError(false);
    setRevision((value) => value + 1);
  }
  const applied = !!supplier || !!type || !!productType;
  const pageItems = filtered.slice((current - 1) * 12, current * 12);
  const featured = current === 1 && !applied && !query.trim() && pageItems.length > 1 ? pageItems[0] : undefined;
  const visible = featured ? pageItems.slice(1) : pageItems;
  return (
    <MarketplaceLayout>
      <MarketplaceHeading
        title={kind ? t(kind === "PANEL" ? "panelsTitle" : "infrastructureTitle") : market("productsTitle")}
        description={kind ? t(kind === "PANEL" ? "panelsDescription" : "infrastructureDescription") : market("productsDescription")}>
        <Marketplace category={kind === "INFRASTRUCTURE" ? "infrastructure" : "solarPanels"} />
      </MarketplaceHeading>
      {featured && <ProductSpotlight offer={featured} lang={lang} />}
      <div className="flex flex-col gap-3">
        <SearchBar
          name={t("search")}
          placeholder={market("productsPlaceholder")}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          actions={
            <div className="flex items-center gap-2">
              <ToolbarAction icon="filter" label={t("filters")} aria-expanded={filtersOpen} onClick={() => setFiltersOpen((value) => !value)} />
              {applied && (
                <ToolbarAction
                  icon="x"
                  label={t("clearFilters")}
                  onClick={() => {
                    setSupplier(undefined);
                    setType(undefined);
                    setProductType("");
                    setPage(1);
                  }}
                />
              )}
              <ToolbarAction icon="refresh" label={t("refresh")} disabled={items === null && !error} onClick={refresh} />
            </div>
          }
        />
        {filtersOpen && (
          <Surface>
            <div className={`grid gap-4 p-4 ${kind === "INFRASTRUCTURE" ? "sm:grid-cols-2" : ""}`}>
              {!kind && (
                <Select
                  clearable={false}
                  name={market("products")}
                  value={productType}
                  options={[
                    [market("allProducts"), ""],
                    [market("panels"), "PANEL"],
                    [market("infrastructure"), "INFRASTRUCTURE"],
                  ]}
                  onChange={(value) => {
                    setProductType(value ?? "");
                    setPage(1);
                  }}
                />
              )}
              <Select
                clearable={false}
                name={t("supplier")}
                placeholder={t("allSuppliers")}
                value={supplier ?? ""}
                options={[[t("allSuppliers"), ""], ...suppliers.map(([id, name]) => [name, id] as const)]}
                onChange={(value) => {
                  setSupplier(value);
                  setPage(1);
                }}
              />
              {kind === "INFRASTRUCTURE" && (
                <Select
                  clearable={false}
                  name={t("type")}
                  placeholder={t("allTypes")}
                  value={type ?? ""}
                  options={[[t("allTypes"), ""], ...types.map((value) => [t(`types.${value}`), value] as const)]}
                  onChange={(value) => {
                    setType(value);
                    setPage(1);
                  }}
                />
              )}
            </div>
          </Surface>
        )}
      </div>
      <section id="ofertas" className="flex scroll-mt-8 flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-subtitle font-semi-bold">{market("start")}</h2>
          <ToolbarAction to={routePaths.searchSolarPanels(lang)} icon="search" label={market("searchProducts")} content={market("searchProducts")} />
        </div>
        <MarketplaceResults
          loading={!items && !error}
          error={error ? t("failed") : undefined}
          empty={items && !filtered.length ? t(items.length ? "noResults" : "empty") : undefined}
          onRetry={refresh}>
          <div className="grid grid-cols-1 items-stretch gap-x-10 gap-y-12 sm:grid-cols-2">
            {visible.slice(0, 6).map((offer) => (
              <OfferCard key={offer.id} offer={offer} lang={lang} />
            ))}
          </div>
        </MarketplaceResults>
      </section>
      {visible.length > 6 && (
        <section className="flex min-w-0 flex-col gap-8">
          <h2 className="text-subtitle font-semi-bold">{market("moreOffers")}</h2>
          <div className="flex snap-x gap-8 overflow-x-auto pb-6">
            {visible.slice(6).map((offer) => (
              <div className="w-80 max-w-full shrink-0 snap-start" key={offer.id}>
                <OfferCard offer={offer} lang={lang} />
              </div>
            ))}
          </div>
        </section>
      )}
      {items && filtered.length > 0 && (
        <Pagination page={current} total={filtered.length} pageSize={12} summaryMode="pages" appearance="borderless" onPageChange={setPage} />
      )}
    </MarketplaceLayout>
  );
}
