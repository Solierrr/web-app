import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { SolarPanelAnnouncement } from "@/features/solar-panel/solarPanel.announcement";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import MarketplaceImage from "./MarketplaceImage";

export default function OfferCard({ offer, lang }: { offer: SolarPanelAnnouncement; lang: SupportedLanguage }) {
  const { t } = useTranslation("feed", { keyPrefix: "catalog" });
  const infrastructure = offer.panel.productType === "INFRASTRUCTURE";
  const attributes = infrastructure
    ? [offer.panel.infrastructureType && t(`types.${offer.panel.infrastructureType}`), offer.panel.material]
    : [offer.panel.powerOutput != null && `${offer.panel.powerOutput} W`, offer.panel.efficiency != null && `${offer.panel.efficiency}%`];
  return (
    <Link
      to={
        infrastructure
          ? routePaths.infrastructureDetail(lang, offer.companySlug, offer.slug)
          : routePaths.productDetail(lang, offer.companySlug, offer.slug)
      }
      className="group flex min-w-0 flex-col gap-4 rounded-surface focus-visible:outline-orange">
      <MarketplaceImage
        src={offer.photos.heroImage.url}
        alt={offer.photos.heroImage.description || offer.title}
        contain
        fallback={infrastructure ? "settings" : "panels"}
        className="aspect-[8/5] rounded-surface"
      />
      <div className="flex flex-col gap-2">
        <p className="line-clamp-1 text-sidebar text-operational-muted">{offer.company.tradeName}</p>
        <h3 className="line-clamp-2 text-body font-semi-bold leading-6 text-operational-ink">{offer.title}</h3>
        <p className="min-h-5 text-sidebar text-operational-muted">{attributes.filter(Boolean).join(" · ")}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="text-label font-semi-bold text-operational-ink">
            {new Intl.NumberFormat(lang, { style: "currency", currency: "BRL" }).format(offer.unitPrice)}{" "}
            <span className="text-sidebar font-medium text-operational-muted">{t("perUnit")}</span>
          </p>
          {offer.discountPercentage != null && offer.discountPercentage > 0 && (
            <span className="rounded-full bg-orange/5 px-2 py-1 text-sidebar text-orange">{t("discount", { value: offer.discountPercentage })}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
