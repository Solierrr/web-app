import { useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { ContextMenu, type ContextMenuHandle } from "@@/overlay/contextMenu/ContextMenu";

interface ModelTableToolbarProps {
  indicatorsVisible: boolean;
  onIndicators: () => void;
  filtered: boolean;
  searchVisible: boolean;
  disabled: boolean;
  refreshing: boolean;
  onFilters: () => void;
  onClearFilters: () => void;
  onRefresh: () => void;
}

export default function ModelTableToolbar({
  indicatorsVisible,
  onIndicators,
  filtered,
  searchVisible,
  disabled,
  refreshing,
  onFilters,
  onClearFilters,
  onRefresh,
}: ModelTableToolbarProps) {
  const { t } = useTranslation("crud", { keyPrefix: "solarPanelModel" });
  const menu = useRef<ContextMenuHandle>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <div className="ml-auto flex shrink-0 items-center justify-end">
      <ToolbarAction
        ref={trigger}
        icon="more"
        label={t("table.settings")}
        className="h-8! w-10!"
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
            [
              { label: t(searchVisible ? "filters.hideBar" : "filters.showBar"), icon: "search", onClick: onFilters, disabled },
              { label: t(indicatorsVisible ? "table.hideIndicators" : "table.showIndicators"), icon: "chart", onClick: onIndicators, disabled },
              { label: t("table.refresh"), icon: "refresh", onClick: onRefresh, disabled: refreshing },
              { label: t("filters.clear"), icon: "filterRemove", onClick: onClearFilters, disabled: !filtered },
            ],
            bounds.right,
            bounds.bottom + 4,
          );
        }}
      />
      <ContextMenu
        ref={menu}
        id={id}
        label={t("table.settings")}
        triggerRef={trigger}
        align="end"
        autoFocus
        onClose={() => {
          setOpen(false);
          trigger.current?.focus();
        }}
      />
    </div>
  );
}
