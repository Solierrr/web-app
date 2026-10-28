import { useTranslation } from "react-i18next";
import MarketplaceImage from "@/features/marketplace/components/MarketplaceImage";
import MarketplaceCard from "@/features/marketplace/components/MarketplaceCard";
import type { CatalogTechnician } from "../../professional.service";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";

export default function ProfessionalCard({ professional, lang }: { professional: CatalogTechnician; lang: SupportedLanguage }) {
  const { t } = useTranslation("marketplace");
  const profile = routePaths.professionalProfile(lang, professional.slug);
  const location = [professional.city, professional.state].filter(Boolean).join(", ");
  const details = [professional.professions[0], location].filter(Boolean).join(" · ");
  return (
    <MarketplaceCard
      href={profile}
      name={professional.name}
      action={{ icon: "messages", label: `${t("contact")}: ${professional.name}`, to: `${profile}#contato` }}
      media={
        <MarketplaceImage
          src={professional.avatarUrl}
          alt={professional.name}
          fallback="users"
          className="aspect-[6/5] rounded-surface [&_img]:object-[center_25%]"
        />
      }>
      <div className="flex min-w-0 flex-col">
        <h3 className="truncate text-body font-semi-bold leading-6 text-operational-ink">{professional.name}</h3>
        {details && (
          <p title={details} className="truncate text-sidebar leading-6 text-operational-muted">
            {details}
          </p>
        )}
      </div>
    </MarketplaceCard>
  );
}
