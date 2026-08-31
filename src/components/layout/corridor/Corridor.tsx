import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { SolarPanelFeedSummary } from "@/features/products/solar-panel/solarPanelAnnouncement";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/routePaths";

interface CorridorProps {
  title: string;
  items: SolarPanelFeedSummary[];
  actionLabel?: string;
  onActionClick?: () => void;
}

export default function Corridor({
  title,
  items,
  actionLabel,
  onActionClick,
}: CorridorProps) {
  const { t } = useTranslation("commons");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const resolvedActionLabel = actionLabel ?? t("corridor.viewAll");

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2>{title}</h2>
        <button
          type="button"
          onClick={onActionClick}
          className="cursor-pointer text-input-text"
        >
          {resolvedActionLabel}
        </button>
      </div>

      <div className="flex flex-row gap-6 overflow-x-auto scrollbar-none">
        {items.map((item) => (
          <Link
            key={item.id}
            to={routePaths.productDetail(lang, item.companySlug, item.slug)}
            className="flex w-60 shrink-0 flex-col gap-2"
          >
            <img
              src={item.photos.heroImage.url}
              alt={item.photos.heroImage.description}
              className="h-60 w-60 rounded-medium bg-input-bg object-cover"
            />
            <p className="font-medium">{item.title}</p>
            <p className="text-input-text">
              R$ {item.unitPrice.toFixed(2)} {t("units.perUnitShort")}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
