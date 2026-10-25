import { useTranslation } from "react-i18next";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { routePaths } from "@/config/i18n/paths";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import type { SolarPanelAnnouncement } from "@/features/solar-panel/solarPanel.announcement";
import MarketplaceImage from "./MarketplaceImage";

export default function ProductSpotlight({ offer, lang }: { offer: SolarPanelAnnouncement; lang: SupportedLanguage }) {
  const { t } = useTranslation("marketplace");
  const { t: catalog } = useTranslation("feed", { keyPrefix: "catalog" });
  const target =
    offer.panel.productType === "INFRASTRUCTURE"
      ? routePaths.infrastructureDetail(lang, offer.companySlug, offer.slug)
      : routePaths.productDetail(lang, offer.companySlug, offer.slug);
  return (
    <section className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-5" aria-label={t("featured")}>
      <article className="grid min-w-0 grid-cols-1 gap-6 rounded-surface bg-operational-surface p-8 sm:grid-cols-2 lg:col-span-3">
        <div className="flex flex-col items-start gap-5">
          <p className="text-body text-operational-muted">{t("featured")}</p>
          <h2 className="line-clamp-3 text-subtitle font-semi-bold leading-tight">{offer.title}</h2>
          <p className="text-body text-operational-muted">{offer.company.tradeName}</p>
          <p className="mt-auto text-label font-semi-bold">
            {new Intl.NumberFormat(lang, { style: "currency", currency: "BRL" }).format(offer.unitPrice)}{" "}
            <span className="text-body font-medium text-operational-muted">{catalog("perUnit")}</span>
          </p>
          <ToolbarAction
            to={target}
            content={t("viewOffer")}
            label={`${t("viewOffer")}: ${offer.title}`}
            icon="chevronRight"
            color="var(--color-orange)"
            className="h-auto! min-h-10 flex-row-reverse rounded-full! px-0!"
          />
        </div>
        <MarketplaceImage
          src={offer.photos.heroImage.url}
          alt={offer.title}
          contain
          fallback="panels"
          eager
          className="min-h-64 rounded-surface sm:min-h-80"
        />
      </article>
      <a
        href="#ofertas"
        className="group relative flex min-h-80 flex-col justify-end overflow-hidden rounded-surface bg-operational-ink p-8 text-white focus-visible:outline-orange lg:col-span-2">
        <img
          src="/images/marketplace/solar-roof.webp"
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
