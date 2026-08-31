import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Select from "@@/ui/select/Select";
import { getSolarPanels } from "@/features/products/solar-panel/solarPanel.service";
import type { SolarPanelFeedSummary } from "@/features/products/solar-panel/solarPanelAnnouncement";
import { DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/locales/languages";
import { routePaths } from "@/config/locales/routePaths";

const MOCK_IDS = ["1", "2", "3", "4", "5", "6", "7", "8"];
const FILTER_CHIPS = [
  "Foto Voltáica",
  "Vertical",
  "Produção Limpa",
  "Horizontal",
];

export default function SolarPanelSearch() {
  const [items, setItems] = useState<SolarPanelFeedSummary[]>([]);
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;

  useEffect(() => {
    let active = true;

    getSolarPanels(MOCK_IDS).then((result) => {
      if (active) {
        setItems(result);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1>Placas Solares</h1>
        <p className="text-black/70">
          As principais placas solares disponíveis no mercado, com os principais
          e mais famosos fornecedores do cenário
        </p>
      </div>

      <div className="flex w-fit flex-row gap-2 rounded-full bg-input-bg p-1">
        <span className="rounded-full bg-white px-4 py-2 font-medium text-orange">
          placas solares
        </span>
        <span className="px-4 py-2 font-medium text-input-text">serviços</span>
        <span className="px-4 py-2 font-medium text-input-text">
          fornecedores
        </span>
      </div>

      <div className="flex flex-row flex-wrap items-center gap-4">
        <Select
          name="filtrar-busca"
          placeholder="Filtrar busca"
          options={FILTER_CHIPS}
          className="min-w-60"
        />
        {FILTER_CHIPS.map((chip) => (
          <span
            key={chip}
            className="rounded-full bg-input-bg px-4 py-2 font-medium text-black/70"
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.id}
            to={routePaths.productDetail(lang, item.companySlug, item.slug)}
            className="flex flex-col gap-2"
          >
            <img
              src={item.photos.heroImage.url}
              alt={item.photos.heroImage.description}
              className="aspect-square w-full rounded-medium bg-input-bg object-cover"
            />
            <p className="font-medium">{item.title}</p>
            <p className="text-input-text">
              R$ {item.unitPrice.toFixed(2)} / uni
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
