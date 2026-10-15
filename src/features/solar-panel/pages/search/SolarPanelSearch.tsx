import Marketplace from "@/features/marketplace/Marketplace";
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getFeedView, sortOffers } from "@/features/marketplace/marketplace.utils";
import Skeleton from "@@/feedback/skeleton/Skeleton";
import { ImageSkeleton } from "@@/feedback/skeleton/Skeleton.presets";
import { getCatalogSolarPanels } from "@/features/solar-panel/solarPanel.service";
import type { SolarPanelFeedSummary } from "@/features/solar-panel/solarPanel.announcement";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import WrapperLayout from "@/config/WrapperLayout";

function SolarPanelSearchContent({ items }: { items: SolarPanelFeedSummary[] }) {
  const [query, setQuery] = useState("");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const [params] = useSearchParams();
  const ordered = sortOffers(items, getFeedView("solarPanels", params.get("view")));
  const normalizedQuery = query
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const filtered = ordered.filter((item) =>
    item.title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .includes(normalizedQuery),
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1>Placas Solares</h1>
        <p className="text-black/70">As principais placas solares disponíveis no mercado, com os principais e mais famosos fornecedores do cenário</p>
      </div>

      <Marketplace category="solarPanels" search />

      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar placa solar"
        aria-label="Buscar placa solar"
        className="w-full max-w-md rounded-lg border border-gray-300 p-3"
      />

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

      <Marketplace category="solarPanels" search />

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

    getCatalogSolarPanels(lang, "PANEL")
      .then((result) => {
        if (active) setItems(result);
      })
      .catch(() => {
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, [lang]);

  return (
    <WrapperLayout ptop>
      {error ? (
        <p role="alert">Não foi possível carregar as placas solares.</p>
      ) : items ? (
        <SolarPanelSearchContent items={items} />
      ) : (
        <SolarPanelSearchSkeleton />
      )}
    </WrapperLayout>
  );
}
