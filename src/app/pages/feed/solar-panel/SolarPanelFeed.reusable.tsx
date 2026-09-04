import { useTranslation } from "react-i18next";
import Corridor from "@@/layout/announcement/corridor/Corridor";
import type { SolarPanelFeedSummary } from "@/features/solar-panel/solarPanelAnnouncement";
import { bestSellers, onSale, newArrivals } from "./SolarPanelFeed.utils";

interface SectionProps {
  items: SolarPanelFeedSummary[];
}

export function BestSellersCorridor({ items }: SectionProps) {
  const { t } = useTranslation("feed", { keyPrefix: "solarPanel.sections" });
  const filtered = bestSellers(items);

  if (filtered.length === 0) return null;
  return <Corridor title={t("bestSellers")} items={filtered} />;
}

export function OnSaleCorridor({ items }: SectionProps) {
  const { t } = useTranslation("feed", { keyPrefix: "solarPanel.sections" });
  const filtered = onSale(items);

  if (filtered.length === 0) return null;
  return <Corridor title={t("onSale")} items={filtered} />;
}

export function NewArrivalsCorridor({ items }: SectionProps) {
  const { t } = useTranslation("feed", { keyPrefix: "solarPanel.sections" });
  const filtered = newArrivals(items);

  if (filtered.length === 0) return null;
  return <Corridor title={t("newArrivals")} items={filtered} />;
}
