import { useParams } from "react-router-dom";
import CatalogFeed from "@/features/marketplace/components/CatalogFeed";
import { getCatalogInfrastructure } from "../infrastructure.service";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
export default function InfrastructureFeed() {
  const { lang: value } = useParams();
  const lang = isSupportedLanguage(value) ? value : DEFAULT;
  return <CatalogFeed key={lang} kind="INFRASTRUCTURE" lang={lang} load={getCatalogInfrastructure} />;
}
