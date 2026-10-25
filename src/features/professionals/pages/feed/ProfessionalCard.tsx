import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MarketplaceImage from "@/features/marketplace/components/MarketplaceImage";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import type { CatalogTechnician } from "../../professional.service";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";

export default function ProfessionalCard({ professional, lang }: { professional: CatalogTechnician; lang: SupportedLanguage }) {
  const { t } = useTranslation("marketplace");
  const profile = routePaths.professionalProfile(lang, professional.slug);
  return (
    <article className="flex min-w-0 flex-col gap-5">
      <Link to={profile} className="group rounded-surface focus-visible:outline-orange" aria-label={professional.name}>
        <MarketplaceImage src={professional.avatarUrl} alt={professional.name} fallback="users" className="aspect-[4/3] rounded-surface" />
      </Link>
      <h3 className="text-body font-semi-bold">
        <Link to={profile}>{professional.name}</Link>
      </h3>
      {professional.professions.length > 0 && <p className="text-body text-operational-muted">{professional.professions.join(" · ")}</p>}
      <ToolbarAction
        to={`${profile}#contato`}
        label={`${t("contact")}: ${professional.name}`}
        content={t("contact")}
        icon="messages"
        color="var(--color-orange)"
        className="mt-auto w-fit px-0!"
      />
    </article>
  );
}
