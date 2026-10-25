import { useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import LanguageSwitcher from "@@/layout/navbar/LanguageSwitcher";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { useSyncExternalStore } from "react";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";

function subscribeSession(listener: () => void) {
  window.addEventListener("solaria:session", listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener("solaria:session", listener);
    window.removeEventListener("storage", listener);
  };
}

export default function Navbar() {
  const { t } = useTranslation("commons", { keyPrefix: "navbar" });
  const { t: tAccess } = useTranslation("onboarding");
  const { t: tCommons } = useTranslation("commons");
  const { t: tFeed } = useTranslation("feed");
  const { t: market } = useTranslation("marketplace");
  const { pathname } = useLocation();
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const searchTarget = [routePaths.companiesFeed(lang), routePaths.searchCompanies(lang)].some((path) => pathname.startsWith(path))
    ? routePaths.searchCompanies(lang)
    : [routePaths.professionalsFeed(lang), routePaths.searchProfessionals(lang)].some((path) => pathname.startsWith(path))
      ? routePaths.searchProfessionals(lang)
      : routePaths.searchSolarPanels(lang);
  const authenticated = useSyncExternalStore(
    subscribeSession,
    () => Boolean(getAuthSession()),
    () => false,
  );

  return (
    <header className="w-full">
      <div className="navbar-frame h-auto! min-h-16 w-full flex-wrap justify-center gap-2 px-4 py-3">
        <ToolbarAction to={routePaths.solarPanelsFeed(lang)} content={market("products")} label={market("products")} />
        <ToolbarAction to={routePaths.professionalsFeed(lang)} content={tFeed("services.title")} label={tFeed("services.title")} />
        <ToolbarAction to={routePaths.companiesFeed(lang)} content={t("companies")} label={t("companies")} />
        <ToolbarAction to={routePaths.registerCompany(lang)} content={tAccess("company")} label={tAccess("company")} />
        {authenticated && <ToolbarAction to={routePaths.dashboard(lang)} content={tAccess("operational")} label={tAccess("operational")} />}
        <ToolbarAction to={routePaths.chatbot(lang)} content={t("support")} label={t("support")} />
        <ToolbarAction to={searchTarget} icon="search" label={tCommons("actions.search")} />
        <ToolbarAction to={routePaths.home(lang)} icon="shoppingCart" label={tCommons("navigation.home")} />
        <ToolbarAction to={routePaths.login(lang)} icon="login" label={t("login")} />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
