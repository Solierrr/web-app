import type { CatalogTechnician } from "@/features/professionals/professional.service";
import type { EntityCardItem } from "@/lib/components/layout/announcement/entity-card/EntityCard";
import type { SupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";

export function toCardItem(professional: CatalogTechnician, lang: SupportedLanguage): EntityCardItem {
  return {
    id: professional.id,
    name: professional.name,
    subtitle: professional.professions[0],
    href: routePaths.professionalProfile(lang, professional.slug),
  };
}
