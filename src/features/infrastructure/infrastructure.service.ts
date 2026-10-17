import { getCatalogSolarPanels } from "@/features/solar-panel/solarPanel.service";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
export function getCatalogInfrastructure(lang: SupportedLanguage) {
  return getCatalogSolarPanels(lang, "INFRASTRUCTURE");
}
