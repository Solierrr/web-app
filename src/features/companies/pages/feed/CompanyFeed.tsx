import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Skeleton from "@@/feedback/skeleton/Skeleton";
import { getCompanies } from "@/features/companies/company.service";
import type { Company } from "@/features/companies/company";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import WrapperLayout from "@/config/WrapperLayout";

import CompanyFeaturedCard from "./CompanyFeaturedCard";
import { orderFeaturedCompanies, orderRecentCompanies, toCompanyFeedItem } from "./CompanyFeed.utils";

type FeedTab = "featured" | "recent";

function CompanyFeedContent({ items }: { items: Company[] }) {
  const { t: tCommons } = useTranslation("commons");
  const { t } = useTranslation("feed");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const [activeTab, setActiveTab] = useState<FeedTab>("featured");
  const tabRefs = useRef<Record<FeedTab, HTMLButtonElement | null>>({ featured: null, recent: null });
  const feedItems = useMemo(() => items.filter((company) => company.type === "SUPPLIER").map(toCompanyFeedItem), [items]);
  const visibleItems = activeTab === "featured" ? orderFeaturedCompanies(feedItems) : orderRecentCompanies(feedItems);

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, tab: FeedTab) {
    const tabOrder: FeedTab[] = ["featured", "recent"];
    const currentIndex = tabOrder.indexOf(tab);
    const nextTab = event.key === "ArrowRight" || event.key === "ArrowDown"
      ? tabOrder[(currentIndex + 1) % tabOrder.length]
      : event.key === "ArrowLeft" || event.key === "ArrowUp"
        ? tabOrder[(currentIndex - 1 + tabOrder.length) % tabOrder.length]
        : event.key === "Home"
          ? tabOrder[0]
          : event.key === "End"
            ? tabOrder[tabOrder.length - 1]
            : undefined;

    if (nextTab) {
      event.preventDefault();
      setActiveTab(nextTab);
      tabRefs.current[nextTab]?.focus();
    }
  }

  return (
    <div className="flex flex-col gap-10 pb-16">
      <header className="flex flex-col items-center gap-4 pt-8 text-center sm:pt-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-orange">{t("company.eyebrow")}</p>
        <h1 className="max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">{t("company.title")}</h1>
        <p className="max-w-2xl text-base text-black/70 sm:text-lg">{t("company.description")}</p>

        <div className="mt-3 flex w-fit flex-row gap-1 rounded-full bg-input-bg p-1">
          <Link to={routePaths.professionalsFeed(lang)} className="rounded-full px-4 py-2 font-medium text-input-text transition-colors hover:text-black">
            {tCommons("navbar.professionals")}
          </Link>
          <span aria-current="page" className="rounded-full bg-white px-4 py-2 font-medium text-orange shadow-sm">
            {tCommons("navbar.companies")}
          </span>
        </div>
      </header>

      <section aria-label={t("company.collectionLabel")} className="flex flex-col gap-6">
        <div className="flex items-center justify-center">
          <div className="flex gap-8 border-b border-black/10" role="tablist" aria-label={t("company.collectionLabel")}>
            {(["featured", "recent"] as const).map((tab) => (
              <button
                key={tab}
                id={`company-feed-tab-${tab}`}
                ref={(element) => { tabRefs.current[tab] = element; }}
                type="button"
                role="tab"
                tabIndex={activeTab === tab ? 0 : -1}
                aria-selected={activeTab === tab}
                aria-controls="company-feed-grid"
                onClick={() => setActiveTab(tab)}
                onKeyDown={(event) => handleTabKeyDown(event, tab)}
                className={`border-b-2 px-1 pb-3 text-sm font-semibold transition-colors ${activeTab === tab ? "border-orange text-black" : "border-transparent text-input-text hover:text-black"}`}
              >
                {t(`company.tabs.${tab}`)}
              </button>
            ))}
          </div>
        </div>

        <div id="company-feed-grid" role="tabpanel" aria-labelledby={`company-feed-tab-${activeTab}`} tabIndex={0}>
          {visibleItems.length > 0 ? (
            <div className="grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleItems.map((item, index) => (
                <CompanyFeaturedCard
                  key={item.company.id}
                  item={item}
                  lang={lang}
                  featured={activeTab === "featured" && index === 0}
                  showFeaturedLabel={activeTab === "featured" && item.featuredOrder !== undefined && index === 0}
                />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-input-text">{t("company.empty")}</p>
          )}
        </div>
      </section>
    </div>
  );
}

function CompanyFeedSkeleton() {
  return (
    <div className="flex flex-col items-center gap-10 pt-12" aria-busy="true">
      <div className="flex w-full flex-col items-center gap-3">
        <Skeleton height="1rem" width="9rem" />
        <Skeleton height="3rem" width="min(32rem, 90%)" />
        <Skeleton height="1.5rem" width="min(36rem, 90%)" />
      </div>
      <Skeleton height="2.5rem" width="16rem" className="rounded-full" />
      <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-hard border border-black/10">
            <Skeleton height="13rem" />
            <div className="flex flex-col gap-3 p-5">
              <Skeleton height="1.5rem" width="70%" />
              <Skeleton height="1rem" width="45%" />
              <Skeleton height="2rem" width="85%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CompanyFeed() {
  const [items, setItems] = useState<Company[] | null>(null);

  useEffect(() => {
    let active = true;

    getCompanies()
      .then((result) => {
        if (active) setItems(result);
      })
      .catch(() => {
        if (active) setItems([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return <WrapperLayout ptop>{items ? <CompanyFeedContent items={items} /> : <CompanyFeedSkeleton />}</WrapperLayout>;
}
