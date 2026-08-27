import { useEffect, useState } from "react";
import Corridor from "@@/layout/corridor/Corridor";
import { getSolarPanels } from "@/service/feed/solarPanel.service";
import type { SolarPanelFeedSummary } from "@/domain/models/announcemnt/solarPanelAnnouncement";

const MOCK_IDS = ["1", "2", "3", "4", "5"];

export default function SolarPanelFeed() {
  const [items, setItems] = useState<SolarPanelFeedSummary[]>([]);

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

      <Corridor
        title="Principais placas solares presentes no mercado"
        items={items}
      />
      <Corridor
        title="Principais placas solares presentes no mercado"
        items={items}
      />
    </div>
  );
}
