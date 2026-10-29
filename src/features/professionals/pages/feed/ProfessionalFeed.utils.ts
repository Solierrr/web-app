import type { CatalogTechnician } from "@/features/professionals/professional.service";
import type { EntityCardItem } from "@/lib/components/layout/announcement/entity-card/EntityCard";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";

export function toCardItem(professional: CatalogTechnician, lang: SupportedLanguage): EntityCardItem {
  return {
    id: professional.id,
    name: professional.name,
    subtitle: professional.professions[0],
    href: routePaths.professionalProfile(lang, professional.slug),
  };
}

export const groups = [
  ["engineering", /engenh|engineer|ingenier/],
  ["installation", /instala|install|eletrot|electrot/],
  ["maintenance", /manuten|mainten|mantenim/],
  ["inspection", /inspe|vistoria|diagn/],
] as const;

export function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function serviceShelves(items: CatalogTechnician[]) {
  return [
    { key: "all", items },
    ...groups.map(([key, pattern]) => ({
      key,
      items: items.filter((person) => person.professions.some((profession) => pattern.test(normalize(profession)))),
    })),
  ].filter((shelf) => shelf.items.length > 0);
}
