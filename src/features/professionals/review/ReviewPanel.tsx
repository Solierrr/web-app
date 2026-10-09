import Checkbox from "@@/ui/checkbox/Checkbox";
import { useSidePanel } from "@@/layout/side-panel/SidePanel.context";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { PrimaryButton, WhiteSolidButton } from "@@/ui/button/Button.presets";
import Confirmation from "@@/overlay/confirmation/Confirmation";
import Textarea from "@@/ui/textarea/Textarea";
import FieldFeedback from "@@/feedback/field-feedback/FieldFeedback";
import LogoLoader from "@@/feedback/logo-loader/LogoLoader";
import Alert from "@@/feedback/alert/Alert";
import StatusField from "@@/ui/status-field/StatusField";
import Select from "@@/ui/select/Select";
import { DetailField } from "@@/layout/operational-page/OperationalDetails";
import DocumentViewer from "@@/ui/document-viewer/DocumentViewer";
import { notify } from "@@/feedback/toast/Toast.utils";
import { getReviewDetails, decideReview, loadReviewDocument, type ReviewDetails } from "./ReviewPanel.service";
export interface ReviewQueueItem {
  id: string;
  name: string;
}
interface ReviewPanelProps {
  initialId: string;
  order: ReviewQueueItem[];
  reloadQueue: () => Promise<ReviewQueueItem[]>;
  onDecided: () => Promise<void>;
}
export default function ReviewPanel({ initialId, order, reloadQueue, onDecided }: ReviewPanelProps) {
  const { t } = useTranslation("reviewPanel");
  const { setPanelBusy } = useSidePanel();
  const start = order.findIndex((item) => item.id === initialId);
  const [queue, setQueue] = useState(() => (start < 0 ? order : [...order.slice(start), ...order.slice(0, start)]));
  const [currentId, setCurrentId] = useState<string | null>(initialId);
  const [auto, setAuto] = useState(true);
  const [processed, setProcessed] = useState<string[]>([]);
  const [result, setResult] = useState<{ id: string; detail: ReviewDetails } | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [fileId, setFileId] = useState("");
  const [choice, setChoice] = useState<boolean | null>(null);
  const [reason, setReason] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    setPanelBusy(busy);
    return () => setPanelBusy(false);
  }, [busy, setPanelBusy]);
  const loading = !!currentId && result?.id !== currentId;
  const detail = loading ? null : result?.detail;
  const submission = detail?.submission;
  const selected = detail?.documents.find((item) => item.id === fileId) ?? detail?.documents[0];
  useEffect(() => {
    if (!currentId) return;
    let active = true;
    getReviewDetails(currentId)
      .then((detail) => {
        if (active) {
          setResult({ id: currentId, detail });
          setError(false);
          setFileId(detail.documents[0]?.id ?? "");
        }
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [currentId, attempt]);
  function navigate(id: string | null) {
    setError(false);
    setCurrentId(id);
    setReason("");
    setChoice(null);
  }
  async function refreshQueue() {
    if (busy || refreshing) return;
    setRefreshing(true);
    try {
      const next = await reloadQueue();
      setQueue(next);
      setProcessed([]);
      navigate(next[0]?.id ?? null);
      setAttempt((value) => value + 1);
    } catch {
      notify(t("refreshError"));
    } finally {
      setRefreshing(false);
    }
  }
  async function confirm() {
    if (!submission || choice === null || busy) return;
    if (!reason.trim()) {
      setInvalid(true);
      document.getElementById("review-reason")?.focus();
      return;
    }
    setPanelBusy(true);
    setBusy(true);
    try {
      const decided = await decideReview(submission, choice, reason.trim());
      const done = [...processed, currentId!];
      setProcessed(done);
      setResult({ id: currentId!, detail: { ...detail!, submission: decided } });
      setChoice(null);
      notify(t(choice ? "approved" : "rejected"));
      // A successful decision is not reported as failed if refreshing the table fails.
      try {
        await onDecided();
      } catch {
        notify(t("refreshError"));
      }
      if (auto) navigate(queue.find((item) => !done.includes(item.id))?.id ?? null);
    } catch {
      notify(t("decisionError"));
    } finally {
      setBusy(false);
    }
  }
  const index = queue.findIndex((item) => item.id === currentId);
  const pending = submission?.status === "MANUAL_REVIEW";
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-operational-surface">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 pb-3">
        <Checkbox label={t("automaticQueue")} checked={auto} disabled={busy} onChange={(event) => setAuto(event.target.checked)} />
        <ToolbarAction icon="refresh" label={t("refreshQueue")} disabled={busy || refreshing} onClick={() => void refreshQueue()} />
      </div>
      {!currentId ? (
        <div className="flex min-h-64 flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <h3 className="text-subtitle font-semi-bold">{t("queueEmpty")}</h3>
          <WhiteSolidButton
            content={t("refresh")}
            description={t("refreshQueue")}
            icon={{ name: "refresh" }}
            disabled={refreshing}
            onClick={() => void refreshQueue()}
          />
        </div>
      ) : (
        <>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
            {error ? (
              <div className="flex flex-col gap-3">
                <Alert>{t("loadError")}</Alert>
                <ToolbarAction
                  icon="refresh"
                  label={t("retry")}
                  content={t("retry")}
                  onClick={() => {
                    setError(false);
                    setAttempt((value) => value + 1);
                  }}
                />
              </div>
            ) : loading ? (
              <div className="flex min-h-64 items-center justify-center">
                <LogoLoader label={t("loading")} />
              </div>
            ) : (
              submission && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-subtitle font-semi-bold">{submission.snapshot.name}</h3>
                    <StatusField
                      state={pending ? "pending" : submission.status === "APPROVED" ? "approved" : "rejected"}
                      label={t(pending ? "pending" : submission.status === "APPROVED" ? "approvedStatus" : "rejectedStatus")}
                    />
                  </div>
                  <dl className="grid grid-cols-2 gap-4">
                    <DetailField label={t("council")} value={submission.snapshot.council} />
                    <DetailField label={t("registration")} value={submission.snapshot.registrationNumber} />
                    <DetailField label={t("email")} value={submission.snapshot.email} />
                    <DetailField label={t("phone")} value={submission.snapshot.phone} />
                  </dl>
                  {detail!.documents.length ? (
                    <>
                      <Select
                        name={t("documents")}
                        value={selected?.id}
                        clearable={false}
                        options={detail!.documents.map((item) => [item.name, item.id] as const)}
                        onChange={(value) => setFileId(value ?? "")}
                      />
                      {selected && <DocumentViewer key={`${currentId}:${selected.id}`} document={selected} load={loadReviewDocument} />}
                    </>
                  ) : (
                    <p className="rounded-medium bg-white p-5 text-operational-muted">{t("noDocuments")}</p>
                  )}
                </>
              )
            )}
          </div>
          <footer className="flex shrink-0 flex-col gap-3 border-t border-operational-border bg-white p-4">
            <nav aria-label={t("professionals")} className="flex items-center justify-between gap-3">
              <ToolbarAction
                icon="chevronLeft"
                label={t("previous")}
                content={t("previous")}
                disabled={busy || index <= 0}
                onClick={() => navigate(queue[index - 1].id)}
              />
              <span className="text-body text-operational-muted tabular-nums">{index >= 0 ? `${index + 1} / ${queue.length}` : ""}</span>
              <ToolbarAction
                icon="chevronRight"
                label={t("next")}
                content={t("next")}
                disabled={busy || index >= queue.length - 1}
                onClick={() => navigate(queue[index + 1]?.id ?? null)}
              />
            </nav>
            {submission && (
              <div className="grid grid-cols-2 gap-3">
                <PrimaryButton
                  content={t("approve")}
                  description={t("approve")}
                  disabled={busy || !pending}
                  onClick={() => {
                    setChoice(true);
                    setReason("");
                    setInvalid(false);
                  }}
                />
                <WhiteSolidButton
                  content={t("reject")}
                  description={t("reject")}
                  disabled={busy || !pending}
                  onClick={() => {
                    setChoice(false);
                    setReason("");
                    setInvalid(false);
                  }}
                />
              </div>
            )}
          </footer>
        </>
      )}
      {choice !== null && submission && (
        <Confirmation
          title={t(choice ? "confirmApprove" : "confirmReject")}
          message={t("confirmMessage", { name: submission.snapshot.name })}
          busy={busy}
          onConfirm={() => void confirm()}
          onCancel={() => setChoice(null)}>
          <label className="flex flex-col gap-2">
            {t("reason")}
            <Textarea
              name="reviewReason"
              id="review-reason"
              aria-label={t("reason")}
              required
              maxLength={2000}
              placeholder={t("reasonPlaceholder")}
              value={reason}
              aria-invalid={invalid}
              aria-describedby={invalid ? "review-reason-error" : undefined}
              className="w-full"
              onChange={(event) => {
                setReason(event.target.value);
                setInvalid(false);
              }}
            />
          </label>
          <FieldFeedback id="review-reason-error" message={invalid ? t("reasonRequired") : null} />
        </Confirmation>
      )}
    </div>
  );
}
