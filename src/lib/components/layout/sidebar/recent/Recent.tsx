import { SIDEBAR_ICON_SIZE, sidebarItemClass, sidebarLabelClass } from "../Sidebar.styles";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  const { pathname } = useLocation();
  const [open, setOpen] = useState(true);
  const keys = useRecentPages(context);
  const pages = keys.flatMap((key) =>
    groups.flatMap((group) => group.items.filter((item) => item.key === key).map((item) => ({ ...item, group: group.label }))),
  );
  const activePath = groups
    .flatMap((group) => group.items.map((item) => item.to(lang)))
    .filter((path) => pathname === path || pathname.startsWith(`${path}/`))
    .sort((a, b) => b.length - a.length)[0];
  const expanded = open || collapsed;
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={expanded}
        aria-label={t("home.recent")}
        title={t("home.recent")}
        className={`${sidebarItemClass(collapsed)} w-full text-operational-ink hover:bg-operational-hover`}>
        <Icon name="history" size={SIDEBAR_ICON_SIZE} className="shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left text-body font-medium">{t("home.recent")}</span>
            <Icon
              name="chevronDown"
              size={SIDEBAR_ICON_SIZE}
              className={`transition-transform duration-250 ease-in-out motion-reduce:transition-none ${open ? "" : "-rotate-90"}`}
            />
          </>
        )}
      </button>
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-250 ease-in-out motion-reduce:transition-none ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <ul inert={!expanded} aria-hidden={!expanded} className="flex min-h-0 flex-col overflow-hidden pt-1">
          {pages.map((page, index) => {
            const to = page.to(lang);
            const active = to === activePath;
            const last = index === pages.length - 1;
            return (
              <li
                key={page.key}
                style={{ transitionDelay: expanded ? `${index * 40}ms` : "0ms" }}
                className={`relative py-0.5 transition-[opacity,translate] duration-250 ease-out motion-reduce:transition-none ${expanded ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"}`}>
                {!collapsed && (
                  <>
                    <span aria-hidden="true" className="absolute left-[21px] top-0 h-1/2 w-[13px] border-b-2 border-l-2 border-input-outline" />
                    {!last && <span aria-hidden="true" className="absolute bottom-0 left-[21px] top-1/2 border-l-2 border-input-outline" />}
                  </>
                )}
                <Link
                  to={to}
                  onClick={onNavigate}
                  title={`${t(page.label)} · ${t(page.group)}`}
                  aria-label={t(page.label)}
                  aria-current={active ? "page" : undefined}
                  className={`${sidebarItemClass(collapsed)} ${active ? "bg-operational-hover text-operational-ink" : "text-operational-muted hover:bg-operational-hover hover:text-operational-ink"} ${collapsed ? "" : "ml-9 px-2.5!"}`}>
                  <Icon name={page.icon} motion={page.icon === "folder" ? "folder" : undefined} size={SIDEBAR_ICON_SIZE} className="shrink-0" />
                  <span aria-hidden={collapsed} className={sidebarLabelClass(collapsed)}>
                    {t(page.label)}
                  </span>
                </Link>
              </li>
            );
          })}
          {pages.length === 0 && !collapsed && <li className="py-1.5 pl-9 text-body text-operational-muted">{t("home.noRecent")}</li>}
        </ul>
      </div>
    </div>
  );
}
