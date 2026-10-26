import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@@/ui/icon/Icon";
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
    <article className="group relative flex min-w-0 flex-col">
      <Link
        to={
          infrastructure
            ? routePaths.infrastructureDetail(lang, offer.companySlug, offer.slug)
            : routePaths.productDetail(lang, offer.companySlug, offer.slug)
        }
        className="flex min-w-0 flex-col rounded-surface focus-visible:outline-orange">
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
        <div className="flex min-h-10 flex-col gap-1 pr-14 pt-4">
          <h3 title={offer.title} className="line-clamp-1 text-body font-semi-bold leading-6 text-operational-ink group-hover:text-dark-orange">
            {name}
          </h3>
          <p className="text-body font-semi-bold leading-6 text-operational-ink">
            {new Intl.NumberFormat(lang, { style: "currency", currency: "BRL" }).format(offer.unitPrice)}{" "}
            <span className="text-sidebar font-medium text-operational-muted">{t("perUnit")}</span>
          </p>
        </div>
      </Link>
      <button
        type="button"
        aria-label={feed("add", { title: offer.title })}
        title={feed("add", { title: offer.title })}
        disabled={adding || offer.availableUnits < 1}
        onClick={() => void addToCart()}
        className="absolute bottom-0 right-0 flex size-10 cursor-pointer items-center justify-center rounded-full bg-operational-surface text-operational-ink transition-colors duration-200 hover:bg-orange/10 hover:text-orange focus-visible:outline-2 focus-visible:outline-orange disabled:cursor-not-allowed disabled:opacity-50">
        <Icon name="plus" size={20} color="currentColor" />
      </button>
    </article>
  );
}
