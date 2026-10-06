import Marketplace from "@/features/marketplace/Marketplace";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { filterCompanies, getFeedView } from "@/features/marketplace/marketplace.utils";
import { useTranslation } from "react-i18next";

import CompanyFeaturedCard from "./CompanyFeaturedCard";
import Skeleton from "@@/feedback/skeleton/Skeleton";

import { ImageSkeleton } from "@@/feedback/skeleton/Skeleton.presets";
import { getCatalogCompanies, type CatalogCompany } from "@/features/companies/company.service";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import WrapperLayout from "@/config/WrapperLayout";

function CompanyFeedContent({ items }: { items: CatalogCompany[] }) {
  const { t } = useTranslation("commons");
  const { t: tFeed } = useTranslation("feed");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const [params] = useSearchParams();
  const filtered = filterCompanies(items, getFeedView("companies", params.get("view")));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1>{t("navbar.companies")}</h1>
        <p className="text-black/70">{tFeed("company.description")}</p>
      </div>

      <div className="flex justify-center">
        <Marketplace category="companies" />
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((company) => (
          <CompanyFeaturedCard key={company.id} company={company} lang={lang} />
        ))}
      </div>
      {filtered.length === 0 && <p>{tFeed("company.empty")}</p>}
    </div>
  );
}

function CompanyFeedSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true">
      <div className="flex flex-col items-center gap-2 text-center">
        <Skeleton height="2.25rem" width="12rem" />
        <Skeleton height="1.5rem" width="60%" />
      </div>

      <div className="flex justify-center">
        <Marketplace category="companies" />
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex flex-col gap-4">
            <ImageSkeleton className="aspect-[4/3] rounded-hard" />
            <div className="flex items-start gap-3">
              <Skeleton height="2.5rem" width="2.5rem" className="shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton height="1.25rem" width="70%" />
                <Skeleton height="1rem" width="90%" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CompanyFeed() {
  const [items, setItems] = useState<CatalogCompany[] | null>(null);
  const [error, setError] = useState(false);
  const { t } = useTranslation("feed");

  useEffect(() => {
    let active = true;

    getCatalogCompanies()
      .then((result) => {
        if (active) setItems(result);
      })
      .catch(() => {
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <WrapperLayout>
        <p role="alert">{t("company.loadError")}</p>
      </WrapperLayout>
    );
  }
  if (items) {
    return (
      <WrapperLayout>
        <CompanyFeedContent items={items} />
      </WrapperLayout>
    );
  } else {
    return (
      <WrapperLayout>
        <CompanyFeedSkeleton />
      </WrapperLayout>
    );
  }
}
