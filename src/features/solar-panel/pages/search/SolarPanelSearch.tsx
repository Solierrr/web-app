import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Skeleton from "@@/feedback/skeleton/Skeleton";
import { ImageSkeleton } from "@@/feedback/skeleton/Skeleton.presets";
import { getCatalogSolarPanels } from "@/features/solar-panel/solarPanel.service";
import type { SolarPanelFeedSummary } from "@/features/solar-panel/solarPanelAnnouncement";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import WrapperLayout from "@/config/WrapperLayout";

function SolarPanelSearchContent({ items }: { items: SolarPanelFeedSummary[] }) {
  const [query, setQuery] = useState("");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const normalizedQuery = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const filtered = items.filter((item) => item.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(normalizedQuery));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1>Placas Solares</h1>
        <p className="text-black/70">As principais placas solares disponíveis no mercado, com os principais e mais famosos fornecedores do cenário</p>
      </div>

      <div className="flex w-fit flex-row gap-2 rounded-full bg-input-bg p-1">
        <span className="rounded-full bg-white px-4 py-2 font-medium text-orange">placas solares</span>
        <span className="px-4 py-2 font-medium text-input-text">serviços</span>
        <span className="px-4 py-2 font-medium text-input-text">fornecedores</span>
      </div>

      <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar placa solar" aria-label="Buscar placa solar" className="w-full max-w-md rounded-lg border border-gray-300 p-3" />

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((item) => (
          <Link key={item.id} to={routePaths.productDetail(lang, item.companySlug, item.slug)} className="flex flex-col gap-2">
            <img
              src={item.photos.heroImage.url}
              alt={item.photos.heroImage.description}
              className="aspect-square w-full rounded-medium bg-input-bg object-cover"
            />
            <p className="font-medium">{item.title}</p>
            <p className="text-input-text">R$ {item.unitPrice.toFixed(2)} / uni</p>
          </Link>
        ))}
      </div>
      {filtered.length === 0 ? <p>Nenhuma placa encontrada.</p> : null}
    </div>
  );
}

function SolarPanelSearchSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true">
      <div className="flex flex-col gap-2">
        <Skeleton height="2.25rem" width="14rem" />
        <Skeleton height="1.5rem" />
      </div>

      <Skeleton height="2.5rem" width="20rem" className="rounded-full" />

      <div className="flex flex-row flex-wrap items-center gap-4">
        <Skeleton height="2.5rem" width="15rem" />
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} height="2.5rem" width="8rem" className="rounded-full" />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <ImageSkeleton />
            <Skeleton height="1.25rem" width="80%" />
            <Skeleton height="1.25rem" width="40%" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SolarPanelSearch() {
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const [items, setItems] = useState<SolarPanelFeedSummary[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    getCatalogSolarPanels(lang).then((result) => {
      if (active) setItems(result);
    }).catch(() => {
      if (active) setError(true);
    });

    return () => {
      active = false;
    };
  }, [lang]);

  return <WrapperLayout ptop>{error ? <p role="alert">Não foi possível carregar as placas solares.</p> : items ? <SolarPanelSearchContent items={items} /> : <SolarPanelSearchSkeleton />}</WrapperLayout>;
}
