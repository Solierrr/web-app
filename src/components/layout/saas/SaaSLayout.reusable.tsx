import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@@/ui/icon/Icon";
import Colors from "@/shared/styles/colors/colors.enum";
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
    <nav aria-label={t("navigation.label")} className="flex-1 overflow-y-auto px-3 py-4">
      {groups.map((group) => (
        <section key={group.key} className="mb-5 last:mb-0">
          {!collapsed && <h2 className="mb-2 px-3 text-lower font-semi-bold uppercase tracking-wide text-gray">{t(group.label)}</h2>}
          <ul className="flex flex-col gap-1">
            {group.items.map((item) => {
              const to = item.to(lang);
              const active = pathname === to;

              return (
                <li key={item.key}>
                  <Link
                    to={to}
                    title={collapsed ? t(item.label) : undefined}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                    className={`flex min-h-10 items-center gap-3 rounded-medium px-3 py-2 font-medium transition-colors duration-150 ${
                      active ? "bg-input-bg text-orange" : "text-black hover:bg-input-bg"
                    } ${collapsed ? "justify-center" : ""}`}>
                    <Icon name={item.icon} size={20} color={active ? Colors.ORANGE : Colors.BLACK} />
                    {!collapsed && <span className="min-w-0 leading-5">{t(item.label)}</span>}
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
