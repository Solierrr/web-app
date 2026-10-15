import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import WrapperLayout from "@/config/WrapperLayout";
import SearchBar from "@@/ui/search-bar/SearchBar";
import Select from "@@/ui/select/Select";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import Pagination from "@@/ui/pagination/Pagination";
import Skeleton from "@@/feedback/skeleton/Skeleton";
import Surface from "@@/ui/surface/Surface";
import Marketplace from "../Marketplace";
import { sortOffers } from "../marketplace.utils";
import OfferCard from "./OfferCard";
import type { SolarPanelAnnouncement } from "@/features/solar-panel/solarPanel.announcement";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";

export default function CatalogFeed({
  kind,
  lang,
  load,
}: {
  kind: "PANEL" | "INFRASTRUCTURE";
  lang: SupportedLanguage;
  load: (lang: SupportedLanguage) => Promise<SolarPanelAnnouncement[]>;
}) {
  const { t } = useTranslation("feed", { keyPrefix: "catalog" });
  const [params] = useSearchParams();
  const [items, setItems] = useState<SolarPanelAnnouncement[] | null>(null);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  const [query, setQuery] = useState("");
  const [supplier, setSupplier] = useState<string>();
  const [type, setType] = useState<string>();
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => {
    let active = true;
    load(lang)
      .then((data) => {
        if (active) {
          setItems(data.filter((item) => (item.panel.productType ?? "PANEL") === kind));
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
        (!type || item.panel.infrastructureType === type) &&
        [item.title, item.company.tradeName, item.panel.brand, item.panel.material]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase(lang)
          .includes(query.trim().toLocaleLowerCase(lang)),
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
  const applied = !!supplier || !!type;
  return (
    <WrapperLayout className="px-4! py-8 sm:px-8! lg:px-10! max-w-operational-page">
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <h1 className="text-operational-title font-semi-bold leading-8">{t(kind === "PANEL" ? "panelsTitle" : "infrastructureTitle")}</h1>
          <p className="max-w-operational-copy text-body text-operational-muted">
            {t(kind === "PANEL" ? "panelsDescription" : "infrastructureDescription")}
          </p>
          <Marketplace category={kind === "PANEL" ? "solarPanels" : "infrastructure"} />
        </header>
        <div className="flex flex-col gap-3">
          <SearchBar
            name={t("search")}
            placeholder={t("search")}
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
        <section className="flex flex-col gap-4" aria-busy={!items && !error}>
          <h2 className="text-label font-semi-bold">{t(view === "trending" ? "trending" : "recent")}</h2>
          {error ? (
            <div className="flex items-center gap-3">
              <p role="alert">{t("failed")}</p>
              <ToolbarAction icon="refresh" label={t("retry")} onClick={refresh} />
            </div>
          ) : !items ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <Surface key={i}>
                  <div className="flex flex-col gap-4 p-5">
                    <Skeleton height="12rem" className="rounded-medium" />
                    <Skeleton height={20} width="85%" />
                    <Skeleton height={20} width="50%" />
                  </div>
                </Surface>
              ))}
            </div>
          ) : filtered.length ? (
            <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.slice((current - 1) * 12, current * 12).map((offer) => (
                <OfferCard key={offer.id} offer={offer} lang={lang} />
              ))}
            </div>
          ) : (
            <p role="status" className="py-10 text-body text-operational-muted">
              {items.length ? t("noResults") : t("empty")}
            </p>
          )}
        </section>
        {items && filtered.length > 0 && (
          <Pagination page={current} total={filtered.length} pageSize={12} summaryMode="pages" appearance="borderless" onPageChange={setPage} />
        )}
      </div>
    </WrapperLayout>
  );
}
