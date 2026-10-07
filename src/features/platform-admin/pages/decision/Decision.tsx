import { useState } from "react";
import { useTranslation } from "react-i18next";
import Confirmation from "@@/overlay/confirmation/Confirmation";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { PrimaryButton, WhiteButton } from "@@/ui/button/Button.presets";
import { notify } from "@@/feedback/toast/Toast.utils";

export default function RegistrationDecision({
  name,
  onDecision,
  compact = false,
}: {
  name: string;
  onDecision: (approved: boolean) => Promise<void>;
  compact?: boolean;
}) {
  const { t } = useTranslation("commons", { keyPrefix: "registrations" });
  const [choice, setChoice] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  async function confirm() {
    if (choice === null || busy) return;
    setBusy(true);
    try {
      await onDecision(choice);
      setChoice(null);
      notify(t(choice ? "approvedSuccess" : "rejectedSuccess"));
    } catch {
      setChoice(null);
      notify(t("decisionError"));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      {compact ? (
        <>
          <ToolbarAction
            icon="check"
            label={t("approve")}
            disabled={busy}
            onClick={() => setChoice(true)}
            color="var(--color-green)"
            backgroundColor="var(--color-input-bg)"
            className="h-8!"
          />
          <ToolbarAction
            icon="x"
            label={t("reject")}
            disabled={busy}
            onClick={() => setChoice(false)}
            color="var(--color-orange-copper)"
            backgroundColor="var(--color-input-bg)"
            className="h-8!"
          />
        </>
      ) : (
        <div className="flex flex-wrap gap-2">
          <PrimaryButton content={t("approve")} description={t("approve")} onClick={() => setChoice(true)} disabled={busy} className="min-h-12" />
          <WhiteButton content={t("reject")} description={t("reject")} onClick={() => setChoice(false)} disabled={busy} className="min-h-12" />
        </div>
      )}
      {choice !== null && (
        <Confirmation
          title={t(choice ? "confirmApprove" : "confirmReject")}
          message={t(choice ? "approveMessage" : "rejectMessage", { name })}
          busy={busy}
          onConfirm={() => void confirm()}
          onCancel={() => setChoice(null)}
        />
      )}
    </>
  );
}
