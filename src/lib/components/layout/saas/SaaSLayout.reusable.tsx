import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@@/ui/icon/Icon";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import type { SaaSNavigationGroup } from "@/features/saas/saas";
import { SIDEBAR_ICON_SIZE, sidebarItemClass, sidebarLabelClass } from "@@/layout/sidebar/Sidebar.styles";
import Recent from "@@/layout/sidebar/recent/Recent";

interface SaaSNavigationProps {
  groups: SaaSNavigationGroup[];
  lang: SupportedLanguage;
  collapsed: boolean;
  onNavigate: () => void;
  context: string;
  before?: ReactNode;
  after?: ReactNode;
}

export function SaaSNavigation({ groups, lang, collapsed, onNavigate, context, before, after }: SaaSNavigationProps) {
  const { pathname } = useLocation();
  const activePath = groups
    .flatMap((group) => group.items.map((item) => item.to(lang)))
    .filter((path) => pathname === path || pathname.startsWith(`${path}/`))
    .sort((a, b) => b.length - a.length)[0];
  const { t } = useTranslation("saas");

  return (
    <nav
      aria-label={t("navigation.label")}
      className={`scrollbar-none min-h-0 flex-1 overflow-x-hidden overflow-y-auto ${collapsed ? "px-2" : "px-3"}`}>
      {before}
      {groups.map((group, index) => (
        <section key={group.key} className="mb-4 last:mb-0">
          {collapsed && index > 0 && <div aria-hidden="true" className="mx-3 mb-4 h-px rounded-full bg-operational-border" />}
          <h2
            aria-hidden={collapsed}
            className={`text-sidebar-group font-medium leading-5 text-operational-muted transition-[height,opacity,margin] duration-250 ease-in-out motion-reduce:transition-none ${collapsed ? "h-0 mb-0 overflow-hidden whitespace-nowrap opacity-0" : "min-h-5 mb-1 px-3 whitespace-normal opacity-100"}`}>
            {t(group.label)}
          </h2>
          <ul className="flex flex-col gap-1">
            {group.items.map((item) => {
              const to = item.to(lang);
              const active = to === activePath;

              return (
                <li key={item.key}>
                  <Link
                    to={to}
                    title={collapsed ? t(item.label) : undefined}
                    aria-label={t(item.label)}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                    className={`${sidebarItemClass(collapsed)} ${active ? "bg-sidebar-active text-operational-ink" : "text-operational-ink hover:bg-sidebar-hover"}`}>
                    <Icon name={item.icon} motion={item.icon === "folder" ? "folder" : undefined} size={SIDEBAR_ICON_SIZE} className="shrink-0" />
                    <span aria-hidden={collapsed} className={sidebarLabelClass(collapsed)}>
                      {t(item.label)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {group.key === "overview" && !collapsed && <Recent groups={groups} lang={lang} context={context} collapsed={collapsed} onNavigate={onNavigate} />}
        </section>
      ))}
      {after}
    </nav>
  );
}

interface SaaSAccountNavigationProps {
  collapsed: boolean;
  signingOut: boolean;
  onLogout: () => Promise<void>;
}

export function SaaSAccountNavigation({ collapsed, signingOut, onLogout }: SaaSAccountNavigationProps) {
  const { t } = useTranslation("saas");
  return (
    <nav aria-label={t("shell.account")} className="py-2">
      {collapsed && <div aria-hidden="true" className="mx-3 mb-2 h-px rounded-full bg-operational-border" />}
      <button
        type="button"
        disabled={signingOut}
        onClick={() => void onLogout().catch(() => undefined)}
        title={t("shell.logout")}
        aria-label={t("shell.logout")}
        className={`${sidebarItemClass(collapsed)} w-full text-operational-ink hover:bg-sidebar-hover disabled:cursor-default disabled:opacity-50`}>
        <Icon name="logout" size={SIDEBAR_ICON_SIZE} className="shrink-0" />
        <span aria-hidden={collapsed} className={sidebarLabelClass(collapsed)}>
          {t("shell.logout")}
        </span>
      </button>
    </nav>
  );
}
