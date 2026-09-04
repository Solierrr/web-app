import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import EntityCorridor from "@@/layout/announcement/corridor/EntityCorridor";
import Skeleton from "@@/feedback/skeleton/Skeleton";

import { ImageSkeleton } from "@@/feedback/skeleton/Skeleton.presets";
import { getCompanies } from "@/features/companies/company.service";
import type { Company } from "@/features/companies/company";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { toCardItem } from "./CompanyFeed.utils";
import WrapperLayout from "@@/layout/wrappers/WrapperLayout";

const MOCK_IDS = ["company-1", "company-2", "company-3"];

function CompanyFeedContent({ items }: { items: Company[] }) {
  const { t } = useTranslation("commons");
  const { t: tFeed } = useTranslation("feed");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1>{t("navbar.companies")}</h1>
        <p className="text-black/70">{tFeed("company.description")}</p>
      </div>

      <div className="flex w-fit flex-row gap-2 rounded-full bg-input-bg p-1">
        <Link to={routePaths.professionalsFeed(lang)} className="px-4 py-2 font-medium text-input-text">
          {t("navbar.professionals")}
        </Link>
        <Link to={routePaths.companiesFeed(lang)} className="rounded-full bg-white px-4 py-2 font-medium text-orange">
          {t("navbar.companies")}
        </Link>
      </div>

      <EntityCorridor title={t("navbar.companies")} items={items.map((company) => toCardItem(company, lang))} />
    </div>
  );
}

function CompanyFeedSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true">
      <div className="flex flex-col gap-2">
        <Skeleton height="2.25rem" width="12rem" />
        <Skeleton height="1.5rem" width="60%" />
      </div>

      <Skeleton height="2.5rem" width="16rem" className="rounded-full" />

      <div className="flex flex-col gap-4">
        <Skeleton height="1.65rem" width="10rem" />
        <div className="flex flex-row gap-6 overflow-hidden">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex w-40 shrink-0 flex-col items-center gap-2">
              <ImageSkeleton className="rounded-full" />
              <Skeleton height="1.25rem" width="80%" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CompanyFeed() {
  const [items, setItems] = useState<Company[] | null>(null);

  useEffect(() => {
    let active = true;

    getCompanies(MOCK_IDS).then((result) => {
      if (active) setItems(result);
    });

    return () => {
      active = false;
    };
  }, []);

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
