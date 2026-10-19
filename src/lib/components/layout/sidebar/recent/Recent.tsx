import { SIDEBAR_ICON_SIZE, sidebarItemClass } from "../Sidebar.styles";
import { useCallback, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@@/ui/icon/Icon";
import { ContextMenu, type ContextMenuHandle } from "@@/overlay/contextMenu/ContextMenu";
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
  const navigate = useNavigate();
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<ContextMenuHandle>(null);
  const id = useId();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => {
    setOpen(false);
    trigger.current?.focus();
  }, []);
  const keys = useRecentPages(context);
  const pages = keys.flatMap((key) => groups.flatMap((group) => group.items.filter((item) => item.key === key)));
  if (collapsed) return null;

  return (
    <div className="mt-2">
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => {
          if (open) {
            menu.current?.close();
            return;
          }
          const bounds = trigger.current?.getBoundingClientRect();
          if (!bounds) return;
          setOpen(true);
          menu.current?.open(
            pages.length
              ? pages.map((page) => ({
                  label: t(page.label),
                  icon: page.icon,
                  onClick: () => {
                    navigate(page.to(lang));
                    onNavigate();
                  },
                }))
              : [{ label: t("home.noRecent"), disabled: true, onClick: () => undefined }],
            bounds.right + 8,
            bounds.top,
          );
        }}
        className={`${sidebarItemClass(false)} w-full text-operational-ink hover:bg-sidebar-hover`}>
        <Icon name="history" size={SIDEBAR_ICON_SIZE} className="shrink-0" />
        <span className="flex-1 text-left">{t("home.recent")}</span>
        <Icon name="chevronRight" size={SIDEBAR_ICON_SIZE} className="shrink-0" />
      </button>
      <ContextMenu
        portalWithinDialog
        ref={menu}
        id={id}
        label={t("home.recent")}
        autoFocus
        triggerRef={trigger}
        onClose={close}
        className="max-w-[calc(100vw-2rem)]"
      />
    </div>
  );
}
