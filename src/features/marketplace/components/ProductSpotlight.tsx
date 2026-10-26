import { useTranslation } from "react-i18next";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import { Link, useNavigate } from "react-router-dom";
import { routePaths } from "@/config/i18n/paths";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import type { SolarPanelAnnouncement } from "@/features/solar-panel/solarPanel.announcement";
import MarketplaceImage from "./MarketplaceImage";

export default function ProductSpotlight({ offer, lang }: { offer: SolarPanelAnnouncement; lang: SupportedLanguage }) {
  const { t } = useTranslation("marketplace");
  const { t: catalog } = useTranslation("feed", { keyPrefix: "catalog" });
  const navigate = useNavigate();
  const target =
    offer.panel.productType === "INFRASTRUCTURE"
      ? routePaths.infrastructureDetail(lang, offer.companySlug, offer.slug)
      : routePaths.productDetail(lang, offer.companySlug, offer.slug);
  return (
    <section className="min-w-0" aria-label={t("featured")}>
      <article className="grid min-w-0 grid-cols-1 items-center gap-4 rounded-surface bg-operational-surface p-6 sm:grid-cols-[1fr_1.2fr] sm:p-12">
        <div className="flex min-w-0 flex-col items-start gap-4">
          <p className="text-sidebar font-semi-bold text-operational-muted">{t("featured")}</p>
          <h2 className="max-w-80 text-title font-bold leading-tight tracking-tight">
            {t(offer.panel.productType === "INFRASTRUCTURE" ? "infrastructureSpotlight" : "productSpotlight")}
          </h2>
          <div className="flex flex-col gap-1">
            <Link data-featured-offer to={target} className="line-clamp-2 text-sidebar text-operational-muted hover:text-orange">
              {offer.title}
            </Link>
            <p className="text-sidebar text-operational-muted">{offer.company.tradeName}</p>
          </div>
          <p className="mt-1 text-label font-semi-bold">
            {new Intl.NumberFormat(lang, { style: "currency", currency: "BRL" }).format(offer.unitPrice)}{" "}
            <span className="text-sidebar font-medium text-operational-muted">{catalog("perUnit")}</span>
          </p>
          <PrimaryButton
            variant="soft"
            onClick={() => navigate(target)}
            content={t("viewOffer")}
            description={`${t("viewOffer")}: ${offer.title}`}
            className="min-h-11"
          />
        </div>
        <MarketplaceImage
          src={offer.photos.heroImage.url}
          alt={offer.title}
          contain
          fallback="panels"
          eager
          className="order-first h-52 w-full rounded-surface sm:order-last sm:h-80"
        />
      </article>
    </section>
  );
}
