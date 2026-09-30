import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import EntityCard from "@/components/layout/announcement/entity-card/EntityCard";
import Skeleton from "@@/feedback/skeleton/Skeleton";
import { ImageSkeleton } from "@@/feedback/skeleton/Skeleton.presets";
import { getCatalogCompanies, type CatalogCompany } from "@/features/companies/company.service";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { toCardItem } from "./CompanySearch.utils";
import WrapperLayout from "@/config/WrapperLayout";

function CompanySearchContent({ items }: { items: CatalogCompany[] }) {
  const { t } = useTranslation("search");
  const [query, setQuery] = useState("");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const normalizedQuery = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const filtered = items.filter((company) =>
    [company.tradeName, company.city, company.state].some((value) =>
      value?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(normalizedQuery)));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1>{t("company.title")}</h1>
        <p className="text-black/70">{t("company.description")}</p>
      </div>

      <input
        type="search"
        aria-label={t("company.queryPlaceholder")}
        placeholder={t("company.queryPlaceholder")}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="w-full max-w-md rounded-lg border border-gray-300 p-3"
      />

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((item) => (
          <EntityCard key={item.id} item={toCardItem(item, lang)} />
        ))}
      </div>
      {filtered.length === 0 ? <p>{t("company.noResults")}</p> : null}
    </div>
  );
}

function CompanySearchSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true">
      <div className="flex flex-col gap-2">
        <Skeleton height="2.25rem" width="12rem" />
        <Skeleton height="1.5rem" width="60%" />
      </div>

      <div className="flex flex-row flex-wrap items-center gap-4">
        <Skeleton height="2.5rem" width="15rem" />
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} height="2.5rem" width="8rem" className="rounded-full" />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <ImageSkeleton className="rounded-full" />
            <Skeleton height="1.25rem" width="80%" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CompanySearch() {
  const [items, setItems] = useState<CatalogCompany[] | null>(null);
  const [error, setError] = useState(false);
  const { t } = useTranslation("search");

  useEffect(() => {
    let active = true;

    getCatalogCompanies().then((result) => {
      if (active) setItems(result);
    }).catch(() => {
      if (active) setError(true);
    });

    return () => {
      active = false;
    };
  }, []);

  return <WrapperLayout ptop>{error ? <p role="alert">{t("company.loadError")}</p> : items ? <CompanySearchContent items={items} /> : <CompanySearchSkeleton />}</WrapperLayout>;
}
