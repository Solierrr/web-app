import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Select from "@@/ui/select/Select";
import MarketplaceLayout from "@/features/marketplace/components/MarketplaceLayout";
import MarketplaceHeading from "@/features/marketplace/components/MarketplaceHeading";
import MarketplaceSearch from "@/features/marketplace/components/MarketplaceSearch";
import MarketplaceResults from "@/features/marketplace/components/MarketplaceResults";
import { useMarketplaceCatalog, useMarketplaceQuery } from "@/features/marketplace/marketplace.hooks";
import { matchesMarketplaceQuery } from "@/features/marketplace/marketplace.utils";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { getCatalogTechnicians } from "../../professional.service";
import ProfessionalCard from "../feed/ProfessionalCard";

export default function ProfessionalSearch() {
  const { t } = useTranslation("marketplace");
  const { t: search } = useTranslation("search");
  const { lang: value } = useParams();
  const lang = isSupportedLanguage(value) ? value : DEFAULT;
  const { items, error, retry } = useMarketplaceCatalog(getCatalogTechnicians);
  const [query, setQuery] = useMarketplaceQuery();
  const [specialty, setSpecialty] = useState("");
  const specialties = [...new Set((items ?? []).flatMap((item) => item.professions))];
  const filtered = (items ?? []).filter(
    (item) => (!specialty || item.professions.includes(specialty)) && matchesMarketplaceQuery(query, item.name, item.crea, ...item.professions),
  );
  return (
    <MarketplaceLayout>
      <MarketplaceHeading title={t("servicesSearchTitle")} description={t("servicesDescription")} centered />
      <MarketplaceSearch domain="services" lang={lang} query={query} onQueryChange={setQuery}>
        <Select
          clearable={false}
          name={t("specialty")}
          value={specialty}
          options={[[t("allSpecialties"), ""], ...specialties.map((value) => [value, value] as const)]}
          onChange={(value) => setSpecialty(value ?? "")}
        />
      </MarketplaceSearch>
      <section className="flex flex-col gap-8">
        <h2 className="text-label font-semi-bold">{t("results", { count: filtered.length })}</h2>
        <MarketplaceResults
          loading={!items && !error}
          error={error ? search("professional.loadError") : undefined}
          empty={items && !filtered.length ? t("noResults") : undefined}
          onRetry={retry}>
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((professional) => (
              <ProfessionalCard key={professional.id} professional={professional} lang={lang} />
            ))}
          </div>
        </MarketplaceResults>
      </section>
    </MarketplaceLayout>
  );
}
