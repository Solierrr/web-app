import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@@/ui/icon/Icon";
import type { SaaSNavigationGroup } from "@/features/saas/saas";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import { useRecentPages } from "@/features/dashboard/dashboard.hooks";

interface RecentProps {
  groups: SaaSNavigationGroup[];
  lang: SupportedLanguage;
  context: string;
  collapsed: boolean;
  onNavigate: () => void;
}

export default function Recent({ groups, lang, context, collapsed, onNavigate }: RecentProps) {
  const { t } = useTranslation("saas");
  const [open, setOpen] = useState(true);
  const keys = useRecentPages(context);
  const pages = keys.flatMap((key) =>
    groups.flatMap((group) => group.items.filter((item) => item.key === key).map((item) => ({ ...item, group: group.label }))),
  );
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={t("home.recent")}
        title={t("home.recent")}
        className={`flex min-h-10 w-full cursor-pointer items-center rounded-small px-3 py-2 hover:bg-operational-hover ${collapsed ? "justify-center" : "gap-3"}`}>
        <Icon name="history" size={20} className="shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left text-lower font-medium">{t("home.recent")}</span>
            <Icon name={open ? "chevronDown" : "chevronLeft"} size={14} />
          </>
        )}
      </button>
      {open && (
        <ul className={`flex flex-col gap-2 pt-2 ${collapsed ? "" : "ml-5 border-l border-operational-border pl-3"}`}>
          {pages.map((page) => (
            <li key={page.key}>
              <Link
                to={page.to(lang)}
                onClick={onNavigate}
                title={t(page.label)}
                aria-label={t(page.label)}
                className={`flex rounded-small py-2 hover:bg-operational-hover ${collapsed ? "justify-center" : "min-w-0 flex-col px-2"}`}>
                {collapsed ? (
                  <Icon name={page.icon} size={20} />
                ) : (
                  <>
                    <span className="truncate text-lower font-medium">{t(page.label)}</span>
                    <span className="truncate text-lower text-operational-muted">{t(page.group)}</span>
                  </>
                )}
              </Link>
            </li>
          ))}
          {pages.length === 0 && !collapsed && <li className="px-2 text-lower text-operational-muted">{t("home.noRecent")}</li>}
        </ul>
      )}
    </div>
  );
}
