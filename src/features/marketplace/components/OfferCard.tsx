import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@@/ui/icon/Icon";
import ValueField from "@@/ui/value-field/ValueField";
import type { SolarPanelAnnouncement } from "@/features/solar-panel/solarPanel.announcement";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
export default function OfferCard({ offer, lang }: { offer: SolarPanelAnnouncement; lang: SupportedLanguage }) {
  const { t } = useTranslation("feed", { keyPrefix: "catalog" });
  const [failed, setFailed] = useState(false);
  const infrastructure = offer.panel.productType === "INFRASTRUCTURE";
  const price = new Intl.NumberFormat(lang, { style: "currency", currency: "BRL" });
  return (
    <Link
      to={
        infrastructure
          ? routePaths.infrastructureDetail(lang, offer.companySlug, offer.slug)
          : routePaths.productDetail(lang, offer.companySlug, offer.slug)
      }
      className="group flex h-full min-w-0 flex-col gap-5 rounded-surface focus-visible:outline-operational-ink">
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-surface bg-operational-surface p-8">
        {!failed && offer.photos.heroImage.url ? (
          <img
            src={offer.photos.heroImage.url}
            alt={offer.photos.heroImage.description || offer.title}
            loading="lazy"
            className="h-full w-full object-contain mix-blend-multiply transition-transform duration-250 group-hover:scale-105 motion-reduce:transform-none"
            onError={() => setFailed(true)}
          />
        ) : (
          <Icon name={infrastructure ? "settings" : "panels"} size={40} className="text-operational-muted" />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <p className="line-clamp-1 text-body text-operational-muted">{offer.company.tradeName}</p>
        <h3 className="min-h-12 line-clamp-2 text-body font-semi-bold leading-6 text-operational-ink">{offer.title}</h3>
      </div>
      <div className="flex min-h-8 flex-wrap gap-2">
        {infrastructure ? (
          <>
            {offer.panel.infrastructureType && <ValueField>{t(`types.${offer.panel.infrastructureType}`)}</ValueField>}
            {offer.panel.material && <ValueField>{offer.panel.material}</ValueField>}
          </>
        ) : (
          <>
            {offer.panel.powerOutput != null && <ValueField>{offer.panel.powerOutput} W</ValueField>}
            {offer.panel.efficiency != null && <ValueField>{offer.panel.efficiency}%</ValueField>}
          </>
        )}
      </div>
      <div className="mt-auto flex flex-col gap-2 pt-2">
        <p className="text-label font-semi-bold text-operational-ink">
          {price.format(offer.unitPrice)} <span className="text-body font-medium text-operational-muted">{t("perUnit")}</span>
        </p>
        {offer.discountPercentage != null && offer.discountPercentage > 0 && (
          <ValueField>{t("discount", { value: offer.discountPercentage })}</ValueField>
        )}
      </div>
    </Link>
  );
}
