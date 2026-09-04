import { useEffect, useState } from "react";
import Corridor from "@/components/layout/announcement/corridor/Corridor";
import Skeleton from "@@/feedback/skeleton/Skeleton";
import { ImageSkeleton } from "@@/feedback/skeleton/Skeleton.presets";
import { getSolarPanels } from "@/features/solar-panel/solarPanel.service";
import type { SolarPanelFeedSummary } from "@/features/solar-panel/solarPanelAnnouncement";
import WrapperLayout from "@/config/WrapperLayout";

const MOCK_IDS = ["1", "2", "3", "4", "5"];

function SolarPanelFeedContent({ items }: { items: SolarPanelFeedSummary[] }) {
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

      <Corridor title="Principais placas solares presentes no mercado" items={items} />
      <Corridor title="Principais placas solares presentes no mercado" items={items} />
    </div>
  );
}

function SolarPanelFeedSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true">
      <div className="flex flex-col gap-2">
        <Skeleton height="2.25rem" width="14rem" />
        <Skeleton height="1.5rem" />
      </div>

      <Skeleton height="2.5rem" width="20rem" className="rounded-full" />

      <div className="flex flex-col gap-4">
        <Skeleton height="1.65rem" width="18rem" />
        <div className="flex flex-row gap-6 overflow-hidden">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex w-60 shrink-0 flex-col gap-2">
              <ImageSkeleton className="h-60 w-60" />
              <Skeleton height="1.25rem" width="80%" />
              <Skeleton height="1.25rem" width="40%" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SolarPanelFeed() {
  const [items, setItems] = useState<SolarPanelFeedSummary[] | null>(null);

  useEffect(() => {
    let active = true;

    getSolarPanels(MOCK_IDS).then((result) => {
      if (active) setItems(result);
    });

    return () => {
      active = false;
    };
  }, []);

  if (items) {
    return (
      <WrapperLayout>
        <SolarPanelFeedContent items={items} />
      </WrapperLayout>
    );
  } else {
    return (
      <WrapperLayout>
        <SolarPanelFeedSkeleton />
      </WrapperLayout>
    );
  }
}
