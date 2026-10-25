import editorialRoof from "@/assets/mocks/editorial/solar-panels-ad6d474c9b41.webp";
import { useTranslation } from "react-i18next";
import Button from "@@/ui/button/Button";
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
    <section className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-5" aria-label={t("featured")}>
      <article className="grid min-w-0 grid-cols-1 items-center gap-4 rounded-surface bg-operational-surface p-6 sm:grid-cols-[1.1fr_1fr] sm:p-8 xl:col-span-3">
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
          <Button
            onClick={() => navigate(target)}
            content={t("viewOffer")}
            description={`${t("viewOffer")}: ${offer.title}`}
            icon={{ name: "chevronRight" }}
            rounded
            className="min-h-11 [&_svg]:size-4"
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
      <a
        href="#ofertas"
        className="group relative flex min-h-64 flex-col justify-end overflow-hidden rounded-surface bg-operational-ink p-8 text-white focus-visible:outline-orange xl:col-span-2">
        <img
          src={editorialRoof}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-operational-ink/80 via-operational-ink/20 to-transparent" />
        <h2 className="relative text-subtitle font-semi-bold leading-tight text-white">
          {t("bannerFirst")}
          <br />
          {t("bannerSecond")}
        </h2>
        <span className="relative mt-5 text-body text-white">{t("exploreOffers")} →</span>
      </a>
    </section>
  );
}
