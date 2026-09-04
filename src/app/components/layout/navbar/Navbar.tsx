import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@@/ui/icon/Icon";
import LanguageSwitcher from "@@/layout/navbar/LanguageSwitcher";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";

export default function Navbar() {
  const { t } = useTranslation("commons", { keyPrefix: "navbar" });
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;

  return (
    <header className="w-full">
      <div className="flex flex-row gap-8 w-full py-5.5 items-center justify-center *:font-semi-bold">
        <Link to={routePaths.home(lang)}>{t("app")}</Link>
        <Link to={routePaths.solarPanelsFeed(lang)}>{t("solarPanels")}</Link>
        <Link to={routePaths.professionalsFeed(lang)}>{t("professionals")}</Link>
        <Link to={routePaths.register(lang)}>{t("accredit")}</Link>
        <Link to={routePaths.chatbot(lang)}>{t("support")}</Link>
        <Link to={routePaths.searchSolarPanels(lang)}>
          <Icon name="search" />
        </Link>
        <Link to={routePaths.home(lang)}>
          <Icon name="shoppingCart" />
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
