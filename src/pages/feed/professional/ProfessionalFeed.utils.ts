import type { Professional } from "@/features/professionals/professional";
import type { EntityCardItem } from "@@/layout/entityCard/EntityCard";
import type { SupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";

export function toCardItem(professional: Professional, lang: SupportedLanguage): EntityCardItem {
  return {
    id: professional.id,
    name: professional.name,
    avatarUrl: professional.avatar,
    subtitle: professional.registrations?.[0]?.profession,
    href: routePaths.professionalProfile(lang, professional.slug),
  };
}
