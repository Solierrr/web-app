import { useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Confirmation from "@@/overlay/confirmation/Confirmation";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { ContextMenu, type ContextMenuHandle, type ContextMenuItem } from "@@/overlay/contextMenu/ContextMenu";

interface ModelRowActionsProps {
  name: string;
  detailsPath: string;
  editable: boolean;
  removable: boolean;
  disabled: boolean;
  onEdit: () => void;
  onRemove: () => Promise<void>;
}

export default function ModelRowActions({ name, detailsPath, editable, removable, disabled, onEdit, onRemove }: ModelRowActionsProps) {
  const { t } = useTranslation("crud", { keyPrefix: "solarPanelModel" });
  const navigate = useNavigate();
  const menu = useRef<ContextMenuHandle>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const { t: common } = useTranslation("commons", { keyPrefix: "operational" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <div className="flex justify-end">
      <ToolbarAction
        ref={trigger}
        icon="more"
        label={t("actions.options", { name })}
        className="h-8! w-10!"
        disabled={disabled}
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
          const actions: ContextMenuItem[] = [{ label: t("actions.view"), icon: "eye", onClick: () => navigate(detailsPath) }];
          if (editable) actions.push({ label: t("actions.edit"), icon: "edit", onClick: onEdit });
          if (removable) actions.push({ label: t("actions.remove"), icon: "trash", onClick: () => setConfirmOpen(true) });
          setOpen(true);
          menu.current?.open(actions, bounds.right, bounds.bottom + 4);
        }}
      />
      {confirmOpen && (
        <Confirmation
          title={t("actions.remove")}
          message={common("confirmAction", { action: t("actions.remove"), name })}
          busy={disabled}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            void onRemove().then(() => setConfirmOpen(false));
          }}
        />
      )}
      <ContextMenu
        ref={menu}
        id={id}
        label={t("actions.options", { name })}
        triggerRef={trigger}
        autoFocus
        align="end"
        onClose={() => {
          setOpen(false);
          trigger.current?.focus();
        }}
      />
    </div>
  );
}
