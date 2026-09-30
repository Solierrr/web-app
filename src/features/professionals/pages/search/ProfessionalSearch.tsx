import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Select from "@@/ui/select/Select";
import EntityCard from "@/components/layout/announcement/entity-card/EntityCard";
import Skeleton from "@@/feedback/skeleton/Skeleton";
import { ImageSkeleton } from "@@/feedback/skeleton/Skeleton.presets";
import { getCatalogTechnicians, type CatalogTechnician } from "@/features/professionals/professional.service";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { toCardItem } from "./ProfessionalSearch.utils";
import WrapperLayout from "@/config/WrapperLayout";

function ProfessionalSearchContent({ items }: { items: CatalogTechnician[] }) {
  const { t } = useTranslation("search");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const filterChips = Object.values(t("professional.filters", { returnObjects: true }) as Record<string, string>);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1>{t("professional.title")}</h1>
        <p className="text-black/70">{t("professional.description")}</p>
      </div>

      <div className="flex flex-row flex-wrap items-center gap-4">
        <Select name="filtrar-busca" placeholder={t("filterPlaceholder")} options={filterChips} className="min-w-60" />
        {filterChips.map((chip) => (
          <span key={chip} className="rounded-full bg-input-bg px-4 py-2 font-medium text-black/70">
            {chip}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <EntityCard key={item.id} item={toCardItem(item, lang)} />
        ))}
      </div>
    </div>
  );
}

function ProfessionalSearchSkeleton() {
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

export default function ProfessionalSearch() {
  const [items, setItems] = useState<CatalogTechnician[] | null>(null);
  const [error, setError] = useState(false);
  const { t } = useTranslation("search");

  useEffect(() => {
    let active = true;

    getCatalogTechnicians().then((result) => {
      if (active) setItems(result);
    }).catch(() => {
      if (active) setError(true);
    });

    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return <WrapperLayout ptop><p role="alert">{t("professional.loadError")}</p></WrapperLayout>;
  }
  return <WrapperLayout ptop>{items ? <ProfessionalSearchContent items={items} /> : <ProfessionalSearchSkeleton />}</WrapperLayout>;
}
