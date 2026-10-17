import { useParams } from "react-router-dom";
import CatalogFeed from "@/features/marketplace/components/CatalogFeed";
import { getCatalogSolarPanels } from "../../solarPanel.service";
import { DEFAULT, isSupportedLanguage, type SupportedLanguage } from "@/config/i18n/browser/languages";
const load = (lang: SupportedLanguage) => getCatalogSolarPanels(lang, "PANEL");
export default function SolarPanelFeed() {
  const { lang: value } = useParams();
  const lang = isSupportedLanguage(value) ? value : DEFAULT;
  return <CatalogFeed key={lang} kind="PANEL" lang={lang} load={load} />;
}
