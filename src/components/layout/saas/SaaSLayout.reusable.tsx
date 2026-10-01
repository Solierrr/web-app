import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@@/ui/icon/Icon";
import { routePaths } from "@/config/inter/paths";
import type { SupportedLanguage } from "@/config/inter/browser/languages";
import type { SaaSNavigationGroup } from "@/features/saas/saas";

interface SaaSNavigationProps {
  groups: SaaSNavigationGroup[];
  lang: SupportedLanguage;
  collapsed: boolean;
  onNavigate: () => void;
}

export function SaaSNavigation({ groups, lang, collapsed, onNavigate }: SaaSNavigationProps) {
  const { pathname } = useLocation();
  const { t } = useTranslation("saas");

  return (
    <nav aria-label={t("navigation.label")} className={`flex-1 overflow-y-auto py-4 ${collapsed ? "px-2" : "px-3"}`}>
      {groups.map((group) => (
        <section key={group.key} className="mb-6 last:mb-0">
          {!collapsed && <h2 className="mb-2 px-3 text-lower font-medium text-operational-muted">{t(group.label)}</h2>}
          <ul className="flex flex-col gap-1">
            {group.items.map((item) => {
              const to = item.to(lang);
              const active = pathname === to || pathname.startsWith(`${to}/`);

              return (
                <li key={item.key}>
                  <Link
                    to={to}
                    title={collapsed ? t(item.label) : undefined}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                    className={`flex min-h-10 items-center gap-3 rounded-small py-2 font-medium transition-colors duration-150 ${
                      active ? "bg-operational-hover text-operational-ink" : "text-operational-ink hover:bg-operational-hover"
                    } ${collapsed ? "justify-center px-2" : "px-3"}`}>
                    <Icon name={item.icon} size={20} />
                    {!collapsed && <span className="min-w-0 text-lower font-medium leading-5">{t(item.label)}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );
}

interface SaaSAccountNavigationProps {
  lang: SupportedLanguage;
  collapsed: boolean;
  signingOut: boolean;
  onNavigate: () => void;
  onLogout: () => Promise<void>;
}

export function SaaSAccountNavigation({ lang, collapsed, signingOut, onNavigate, onLogout }: SaaSAccountNavigationProps) {
  const { t } = useTranslation("saas");
  const { pathname } = useLocation();
  const items = [
    { to: routePaths.ownUserProfile(lang), icon: "user" as const, label: t("navigation.items.profile") },
    { to: routePaths.settings(lang), icon: "settings" as const, label: t("navigation.items.settings") },
    { to: routePaths.home(lang), icon: "globe" as const, label: t("shell.backToSite") },
  ];
  const itemClass = `flex min-h-10 items-center gap-3 rounded-small py-2 hover:bg-operational-hover ${collapsed ? "justify-center px-2" : "px-3"}`;
  return (
    <nav aria-label={t("shell.account")} className={`border-t border-operational-border ${collapsed ? "p-2" : "p-3"}`}>
      {items.map((item) => {
        const active = pathname === item.to || (item.icon === "settings" && pathname.startsWith(`${item.to}/`));
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            title={item.label}
            aria-current={active ? "page" : undefined}
            className={`${itemClass} ${active ? "bg-operational-hover" : ""}`}>
            <Icon name={item.icon} size={18} />
            {!collapsed && <span className="text-lower font-medium">{item.label}</span>}
          </Link>
        );
      })}
      <button
        type="button"
        disabled={signingOut}
        onClick={() => void onLogout().catch(() => undefined)}
        title={t("shell.logout")}
        className={`${itemClass} w-full`}>
        <Icon name="logout" size={18} />
        {!collapsed && <span className="text-lower font-medium">{t("shell.logout")}</span>}
      </button>
    </nav>
  );
}
