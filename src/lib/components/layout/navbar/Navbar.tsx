import { ContextMenu, type ContextMenuHandle } from "@@/overlay/contextMenu/ContextMenu";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
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
  const within = (...paths: string[]) => paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const section = within(routePaths.companiesFeed(lang), routePaths.searchCompanies(lang))
    ? "companies"
    : within(routePaths.professionalsFeed(lang), routePaths.searchProfessionals(lang))
      ? "services"
      : within(
            routePaths.solarPanelsFeed(lang),
            routePaths.infrastructureFeed(lang),
            routePaths.searchSolarPanels(lang),
            routePaths.productDetail(lang, "", "").replace(/\/+$/, ""),
          ) || pathname === routePaths.home(lang) || pathname === `${routePaths.home(lang)}/`
        ? "products"
        : undefined;
  const searchTarget =
    section === "companies"
      ? routePaths.searchCompanies(lang)
      : section === "services"
        ? routePaths.searchProfessionals(lang)
        : routePaths.searchSolarPanels(lang);
  const links = [
    { key: "products", to: routePaths.solarPanelsFeed(lang), label: market("products") },
    { key: "services", to: routePaths.professionalsFeed(lang), label: tFeed("services.title") },
    { key: "companies", to: routePaths.companiesFeed(lang), label: t("companies") },
  ];
  const authenticated = useSyncExternalStore(
    subscribeSession,
    () => Boolean(getAuthSession()),
    () => false,
  );

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="navbar-frame h-auto! min-h-16 w-full flex-wrap justify-between gap-x-4 gap-y-1 px-4 py-2 sm:px-8">
        <Link to={routePaths.home(lang)} aria-label={tCommons("navigation.home")} className="flex shrink-0 items-center rounded-full focus-visible:outline-orange">
          <img src="/favicon.svg" alt="" className="size-8" />
        </Link>
        <nav aria-label={tCommons("navigation.home")} className="order-last flex w-full items-center justify-center gap-1 sm:order-none sm:w-auto">
          {links.map((link) => {
            const active = section === link.key;
            return (
              <ToolbarAction
                key={link.key}
                to={link.to}
                content={link.label}
                label={link.label}
                aria-current={active ? "page" : undefined}
                color={active ? "var(--color-orange)" : "var(--color-operational-muted)"}
                hoverColor={active ? "var(--color-orange)" : "var(--color-operational-ink)"}
                backgroundColor={active ? "color-mix(in srgb, var(--color-orange) 8%, transparent)" : "transparent"}
                hoverBackgroundColor={active ? "color-mix(in srgb, var(--color-orange) 12%, transparent)" : "var(--color-operational-hover)"}
                className={`rounded-full! ${active ? "[&_span]:font-semi-bold" : ""}`}
              />
            );
          })}
        </nav>
        <div className="flex items-center">
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
