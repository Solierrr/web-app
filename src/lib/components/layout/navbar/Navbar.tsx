import { ContextMenu, type ContextMenuHandle } from "@@/overlay/contextMenu/ContextMenu";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import LanguageSwitcher from "@@/layout/navbar/LanguageSwitcher";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { useRef, useSyncExternalStore } from "react";
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
  const navigate = useNavigate();
  const menu = useRef<ContextMenuHandle>(null);
  const trigger = useRef<HTMLButtonElement>(null);
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
      <div className="navbar-frame h-auto! min-h-16 w-full flex-wrap justify-center gap-x-2 gap-y-1 px-4 py-2">
        <nav aria-label={tCommons("navigation.home")} className="flex items-center">
          <ToolbarAction to={routePaths.solarPanelsFeed(lang)} content={market("products")} label={market("products")} />
          <ToolbarAction to={routePaths.professionalsFeed(lang)} content={tFeed("services.title")} label={tFeed("services.title")} />
          <ToolbarAction to={routePaths.companiesFeed(lang)} content={t("companies")} label={t("companies")} />
        </nav>
        <div className="flex items-center border-l border-operational-border pl-2">
          <ToolbarAction to={searchTarget} icon="search" label={tCommons("actions.search")} />
          <ToolbarAction to={routePaths.cart(lang)} icon="shoppingCart" label={t("cart")} />
          <ToolbarAction
            ref={trigger}
            icon="user"
            label={t("account")}
            aria-haspopup="menu"
            onClick={() => {
              const anchor = trigger.current?.getBoundingClientRect();
              menu.current?.open(
                [
                  {
                    label: authenticated ? tAccess("operational") : t("login"),
                    onClick: () => navigate(authenticated ? routePaths.dashboard(lang) : routePaths.login(lang)),
                  },
                  { label: tAccess("haveCode"), onClick: () => navigate(routePaths.activateAccess(lang)) },
                  { label: tAccess("company"), onClick: () => navigate(routePaths.registerCompany(lang)) },
                  { label: tAccess("professional"), onClick: () => navigate(routePaths.registerProfessional(lang)) },
                  { label: t("support"), onClick: () => navigate(routePaths.chatbot(lang)) },
                ],
                anchor?.right ?? 0,
                anchor?.bottom ?? 0,
              );
            }}
          />
          <ContextMenu ref={menu} triggerRef={trigger} align="end" label={t("account")} />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
