import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@@/ui/icon/Icon";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import type { SaaSNavigationGroup } from "@/features/saas/saas";
import Recent from "@@/layout/sidebar/recent/Recent";

interface SaaSNavigationProps {
  groups: SaaSNavigationGroup[];
  lang: SupportedLanguage;
  collapsed: boolean;
  onNavigate: () => void;
  context: string;
}

export function SaaSNavigation({ groups, lang, collapsed, onNavigate, context }: SaaSNavigationProps) {
  const { pathname } = useLocation();
  const { t } = useTranslation("saas");

  return (
    <nav aria-label={t("navigation.label")} className="scrollbar-none min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 py-4">
      {groups.map((group, index) => (
        <section key={group.key} className="mb-4 last:mb-0">
          {collapsed && index > 0 && <div aria-hidden="true" className="mx-3 mb-4 h-px rounded-full bg-operational-border" />}
          <h2
            aria-hidden={collapsed}
            className={`overflow-hidden whitespace-nowrap px-3 text-lower font-medium text-operational-muted transition-[height,opacity,margin] duration-250 ease-in-out motion-reduce:transition-none ${collapsed ? "h-0 mb-0 opacity-0" : "h-5 mb-2 opacity-100"}`}>
            {t(group.label)}
          </h2>
          <ul className="flex flex-col gap-2">
            {group.items.map((item) => {
              const to = item.to(lang);
              const active = pathname === to || pathname.startsWith(`${to}/`);

              return (
                <li key={item.key}>
                  <Link
                    to={to}
                    title={collapsed ? t(item.label) : undefined}
                    aria-label={t(item.label)}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                    className={`flex min-h-10 items-center overflow-hidden rounded-small px-3 py-2 font-medium transition-[gap,background-color,color] duration-250 ease-in-out motion-reduce:transition-none ${
                      active ? "bg-operational-hover text-operational-ink" : "text-operational-ink hover:bg-operational-hover"
                    } ${collapsed ? "justify-center gap-0" : "gap-3"}`}>
                    <Icon name={item.icon} size={20} className="shrink-0" />
                    <span
                      aria-hidden={collapsed}
                      className={`min-w-0 overflow-hidden whitespace-nowrap text-lower font-medium leading-5 transition-[max-width,opacity] duration-250 ease-in-out motion-reduce:transition-none ${collapsed ? "max-w-0 opacity-0" : "max-w-48 opacity-100"}`}>
                      {t(item.label)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {group.key === "overview" && <Recent groups={groups} lang={lang} context={context} collapsed={collapsed} onNavigate={onNavigate} />}
        </section>
      ))}
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
  const itemClass = `flex min-h-10 items-center overflow-hidden rounded-small px-3 py-2 hover:bg-operational-hover transition-[gap,background-color] duration-250 ease-in-out motion-reduce:transition-none ${collapsed ? "justify-center gap-0" : "gap-3"}`;
  const labelClass = `overflow-hidden whitespace-nowrap text-lower font-medium transition-[max-width,opacity] duration-250 ease-in-out motion-reduce:transition-none ${collapsed ? "max-w-0 opacity-0" : "max-w-48 opacity-100"}`;
  return (
    <nav aria-label={t("shell.account")} className="p-2">
      {collapsed && <div aria-hidden="true" className="mx-3 mb-2 h-px rounded-full bg-operational-border" />}
      <button
        type="button"
        disabled={signingOut}
        onClick={() => void onLogout().catch(() => undefined)}
        title={t("shell.logout")}
        aria-label={t("shell.logout")}
        className={`${itemClass} w-full`}>
        <Icon name="logout" size={20} className="shrink-0" />
        <span aria-hidden={collapsed} className={labelClass}>
          {t("shell.logout")}
        </span>
      </button>
    </nav>
  );
}
