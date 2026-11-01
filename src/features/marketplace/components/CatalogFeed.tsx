import { Fragment, useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  buildOfferShelves,
  feedHighlightFormats,
  getFeedView,
  sortOffers,
  type FeedHighlightFormat,
  type OfferShelf as Shelf,
} from "../marketplace.utils";
import { useMarketplaceCatalog } from "../marketplace.hooks";
import OfferCard from "./OfferCard";
import OfferShelf from "./OfferShelf";
import MarketplaceLayout from "./MarketplaceLayout";
import MarketplacePageHeader from "./MarketplacePageHeader";
import MarketplaceResults from "./MarketplaceResults";
import FeedHighlight from "./FeedHighlight";
import type { SolarPanelAnnouncement } from "@/features/solar-panel/solarPanel.announcement";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";

const SHELVES_BETWEEN_HIGHLIGHTS = 2;

function shuffle<T>(values: T[]): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function CatalogFeed({
  kind,
  lang,
  load,
}: {
  kind?: "PANEL" | "INFRASTRUCTURE";
  lang: SupportedLanguage;
  load: (lang: SupportedLanguage) => Promise<SolarPanelAnnouncement[]>;
}) {
  const { t } = useTranslation("feed", { keyPrefix: "catalog" });
  const { t: feed } = useTranslation("marketplace", { keyPrefix: "feed" });
  const { t: market } = useTranslation("marketplace");
  const [params] = useSearchParams();
  const category = kind === "INFRASTRUCTURE" ? "infrastructure" : "solarPanels";
  const view = getFeedView(category, params.get("view"));
  const loadForLanguage = useCallback(() => load(lang), [load, lang]);
  const { items: loaded, error, retry } = useMarketplaceCatalog(loadForLanguage);
  const items = useMemo(() => loaded?.filter((item) => !kind || (item.panel.productType ?? "PANEL") === kind) ?? null, [loaded, kind]);
  const [slots] = useState<FeedHighlightFormat[]>(() => shuffle(feedHighlightFormats));
  const all = sortOffers(items ?? [], view);
  const shelves = buildOfferShelves(items ?? [], view);
  let slotIndex = 0;
  function nextHighlight() {
    const slot = slots[slotIndex++ % slots.length];
    return <FeedHighlight format={slot} lang={lang} />;
  }
  const shelfTitle = (shelf: Shelf<SolarPanelAnnouncement>) => feed(`shelves.${shelf.kind}`, { name: shelf.name });
  return (
    <MarketplaceLayout>
      <MarketplacePageHeader
        title={kind === "INFRASTRUCTURE" ? t("infrastructureTitle") : market("productsTitle")}
        description={kind === "INFRASTRUCTURE" ? t("infrastructureDescription") : market("productsDescription")}
        category={category}
      />
      <MarketplaceResults
        loading={!items && !error}
        error={error ? t("failed") : undefined}
        empty={items && !all.length ? t("empty") : undefined}
        onRetry={retry}>
        {shelves.map((shelf, index) => (
          <Fragment key={shelf.key}>
            <OfferShelf title={shelfTitle(shelf)}>
              {shelf.items.map((offer, position) => (
                <div className="w-72 shrink-0 snap-start sm:w-88" key={offer.id}>
                  <OfferCard offer={offer} lang={lang} label={shelf.kind === "trending" && position < 3 ? feed("mostWanted") : undefined} />
                </div>
              ))}
            </OfferShelf>
            {(index + 1) % SHELVES_BETWEEN_HIGHLIGHTS === 0 && nextHighlight()}
          </Fragment>
        ))}
      </MarketplaceResults>
    </MarketplaceLayout>
  );
}
