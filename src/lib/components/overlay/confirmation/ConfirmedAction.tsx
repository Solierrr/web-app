import { useState } from "react";
import { useTranslation } from "react-i18next";
import Confirmation from "./Confirmation";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import type { IconName } from "@@/ui/icon/Icon";
import { notify } from "@@/feedback/toast/Toast.utils";

export default function ConfirmedAction({
  label,
  name,
  icon = "trash",
  onConfirm,
}: {
  label: string;
  name: string;
  icon?: IconName;
  onConfirm: () => Promise<void>;
}) {
  const { t } = useTranslation("commons", { keyPrefix: "operational" });
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  async function confirm() {
    if (busy) return;
    setBusy(true);
    try {
      await onConfirm();
      setOpen(false);
      notify(t("actionSuccess"));
    } catch {
      setOpen(false);
      notify(t("actionError"));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <ToolbarAction
        icon={icon}
        label={label}
        className="h-8! w-10!"
        backgroundColor="var(--color-input-bg)"
        disabled={busy}
        onClick={() => setOpen(true)}
      />
      {open && (
        <Confirmation
          title={label}
          message={t("confirmAction", { action: label, name })}
          busy={busy}
          onCancel={() => setOpen(false)}
          onConfirm={() => void confirm()}
        />
      )}
    </>
  );
}
