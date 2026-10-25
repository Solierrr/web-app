import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Select from "@@/ui/select/Select";
import MarketplaceLayout from "@/features/marketplace/components/MarketplaceLayout";
import MarketplaceHeading from "@/features/marketplace/components/MarketplaceHeading";
import MarketplaceSearch from "@/features/marketplace/components/MarketplaceSearch";
import MarketplaceResults from "@/features/marketplace/components/MarketplaceResults";
import { useMarketplaceCatalog, useMarketplaceQuery } from "@/features/marketplace/marketplace.hooks";
import { filterCompanies, matchesMarketplaceQuery } from "@/features/marketplace/marketplace.utils";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { getCatalogCompanies } from "../../company.service";
import CompanyFeaturedCard from "../feed/CompanyFeaturedCard";

export default function CompanySearch() {
  const { t } = useTranslation("marketplace");
  const { t: feed } = useTranslation("feed");
  const { t: search } = useTranslation("search");
  const { lang: value } = useParams();
  const lang = isSupportedLanguage(value) ? value : DEFAULT;
  const { items, error, retry } = useMarketplaceCatalog(getCatalogCompanies);
  const [query, setQuery] = useMarketplaceQuery();
  const [type, setType] = useState("");
  const filtered = (type ? filterCompanies(items ?? [], type) : (items ?? [])).filter((item) =>
    matchesMarketplaceQuery(query, item.tradeName, item.city, item.state),
  );
  return (
    <MarketplaceLayout>
      <MarketplaceHeading title={t("companiesSearchTitle")} description={t("companiesDescription")} centered />
      <MarketplaceSearch domain="companies" lang={lang} query={query} onQueryChange={setQuery}>
        <Select
          clearable={false}
          name={feed("views.labels.companies")}
          value={type}
          options={[[t("companies"), ""], ...["suppliers", "providers", "other"].map((key) => [feed(`views.${key}`), key] as const)]}
          onChange={(value) => setType(value ?? "")}
        />
      </MarketplaceSearch>
      <section className="flex flex-col gap-8">
        <h2 className="text-label font-semi-bold">{t("results", { count: filtered.length })}</h2>
        <MarketplaceResults
          loading={!items && !error}
          error={error ? search("company.loadError") : undefined}
          empty={items && !filtered.length ? search("company.noResults") : undefined}
          onRetry={retry}>
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((company) => (
              <CompanyFeaturedCard key={company.id} company={company} lang={lang} variant="logo" />
            ))}
          </div>
        </MarketplaceResults>
      </section>
    </MarketplaceLayout>
  );
}
