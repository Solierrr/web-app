import type { ReactNode } from "react";
import Dialog from "../dialog/Dialog";
import { useTranslation } from "react-i18next";
import { PrimaryButton, WhiteSolidButton } from "@@/ui/button/Button.presets";

export default function Confirmation({
  title,
  message,
  busy,
  onConfirm,
  onCancel,
  children,
  confirmDisabled = false,
}: {
  children?: ReactNode;
  confirmDisabled?: boolean;
  title: string;
  message: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation("commons");
  return (
    <Dialog title={title} message={message} busy={busy} onClose={onCancel} compact>
      {(dismiss, closing) => (
        <>
          {children && <div className="text-left">{children}</div>}
          <div className={`${children ? "mt-6 " : ""}grid grid-cols-2 gap-3`}>
            <WhiteSolidButton
              autoFocus
              content={t("actions.cancel")}
              description={t("actions.cancel")}
              onClick={dismiss}
              disabled={busy || closing}
              className="min-h-12 min-w-0 w-full px-3!"
            />
            <PrimaryButton
              variant="soft"
              content={t("actions.confirm")}
              description={t("actions.confirm")}
              onClick={onConfirm}
              disabled={busy || closing || confirmDisabled}
              className="min-h-12 min-w-0 w-full px-3!"
            />
          </div>
        </>
      )}
    </Dialog>
  );
}
