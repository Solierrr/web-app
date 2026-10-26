import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { buildOfferShelves, feedHighlightFormats, sortOffers, type FeedHighlightFormat, type OfferShelf as Shelf } from "../marketplace.utils";
import OfferCard from "./OfferCard";
import OfferShelf from "./OfferShelf";
import MarketplaceLayout from "./MarketplaceLayout";
import MarketplaceHeading from "./MarketplaceHeading";
import MarketplaceResults from "./MarketplaceResults";
import ProductSpotlight from "./ProductSpotlight";
import FeedHighlight from "./FeedHighlight";
import type { SolarPanelAnnouncement } from "@/features/solar-panel/solarPanel.announcement";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";

type Slot = FeedHighlightFormat | "spotlight";

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
  const [items, setItems] = useState<SolarPanelAnnouncement[] | null>(null);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  const [slots] = useState<Slot[]>(() => shuffle<Slot>(["spotlight", ...feedHighlightFormats]));
  useEffect(() => {
    let active = true;
    load(lang)
      .then((data) => {
        if (active) {
          setItems(data.filter((item) => !kind || (item.panel.productType ?? "PANEL") === kind));
          setError(false);
        }
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [lang, load, kind, revision]);
  const all = sortOffers(items ?? [], "recent");
  const shelves = buildOfferShelves(items ?? []);
  function refresh() {
    setItems(null);
    setError(false);
    setRevision((value) => value + 1);
  }
  let slotIndex = 0;
  function nextHighlight() {
    const slot = slots[slotIndex++ % slots.length];
    if (slot === "spotlight") return all[0] ? <ProductSpotlight offer={sortOffers(all, "trending")[0]} lang={lang} /> : null;
    return <FeedHighlight format={slot} lang={lang} />;
  }
  const shelfTitle = (shelf: Shelf<SolarPanelAnnouncement>) => feed(`shelves.${shelf.kind}`, { name: shelf.name });
  return (
    <MarketplaceLayout>
      {kind === "INFRASTRUCTURE" && (
        <MarketplaceHeading title={t("infrastructureTitle")} description={t("infrastructureDescription")} />
      )}
      <MarketplaceResults
        loading={!items && !error}
        error={error ? t("failed") : undefined}
        empty={items && !all.length ? t("empty") : undefined}
        onRetry={refresh}>
        {nextHighlight()}
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
