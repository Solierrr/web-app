import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MarketplaceCard from "./MarketplaceCard";
import { notify } from "@@/feedback/toast/Toast.utils";
import { putCartItem } from "@/features/purchases/purchases.service";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import type { SolarPanelAnnouncement } from "@/features/solar-panel/solarPanel.announcement";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import MarketplaceImage from "./MarketplaceImage";

export default function OfferCard({ offer, lang, label }: { offer: SolarPanelAnnouncement; lang: SupportedLanguage; label?: string }) {
  const { t } = useTranslation("feed", { keyPrefix: "catalog" });
  const { t: feed } = useTranslation("marketplace", { keyPrefix: "feed" });
  const { t: announcement } = useTranslation("announcements", { keyPrefix: "solarPanel" });
  const navigate = useNavigate();
  const location = useLocation();
  const [adding, setAdding] = useState(false);
  const infrastructure = offer.panel.productType === "INFRASTRUCTURE";
  const discount = offer.discountPercentage != null && offer.discountPercentage > 0 ? t("discount", { value: offer.discountPercentage }) : undefined;
  const badge = label ?? discount;
  const name = offer.title.split(" - ")[0];

  async function addToCart() {
    if (adding || offer.availableUnits < 1) return;
    if (!getAuthSession()) {
      navigate(routePaths.login(lang), { state: { returnTo: location.pathname + location.search } });
      return;
    }
    setAdding(true);
    try {
      await putCartItem(offer.id, 1);
      notify(feed("added", { title: offer.title }));
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : announcement("actions.addToCartError"));
    } finally {
      setAdding(false);
    }
  }

  return (
    <MarketplaceCard
      href={
        infrastructure
          ? routePaths.infrastructureDetail(lang, offer.companySlug, offer.slug)
          : routePaths.productDetail(lang, offer.companySlug, offer.slug)
      }
      name={offer.title}
      action={{
        icon: "plus",
        label: feed("add", { title: offer.title }),
        disabled: adding || offer.availableUnits < 1,
        onClick: () => void addToCart(),
      }}
      media={
        <div className="relative">
          <MarketplaceImage
            src={offer.photos.heroImage.url}
            alt={offer.photos.heroImage.description || offer.title}
            contain
            fallback={infrastructure ? "settings" : "panels"}
            className="aspect-[6/5] rounded-surface [&_img]:p-8"
          />
          {badge && (
            <span className="absolute left-4 top-4 max-w-[calc(100%-2rem)] truncate rounded-full bg-white/90 px-3 py-1.5 text-sidebar font-bold text-operational-ink backdrop-blur">
              {badge}
            </span>
          )}
        </div>
      }>
      <div className="flex min-w-0 flex-col gap-1">
        <h3 title={offer.title} className="line-clamp-1 text-body font-semi-bold leading-6 text-operational-ink">
          {name}
        </h3>
        <p className="text-body font-semi-bold leading-6 text-operational-ink">
          {new Intl.NumberFormat(lang, { style: "currency", currency: "BRL" }).format(offer.unitPrice)}{" "}
          <span className="text-sidebar font-medium text-operational-muted">{t("perUnit")}</span>
        </p>
      </div>
    </MarketplaceCard>
  );
}
