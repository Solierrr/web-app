import DocumentViewer from "@@/ui/document-viewer/DocumentViewer";
import Confirmation from "@@/overlay/confirmation/Confirmation";
import { notify } from "@@/feedback/toast/Toast.utils";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Surface from "@@/ui/surface/Surface";
import Textarea from "@@/ui/textarea/Textarea";
import { PrimaryButton, WhiteButton } from "@@/ui/button/Button.presets";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { decideSubmission, getDocumentInfo, loadProfessionalDocument, getSubmission } from "../professional.submission.service";
import type { ProfessionalSubmission } from "../professional.submission";

function Evidence({ id, number }: { id: string; number: number }) {
  const { t } = useTranslation("deeplink");
  const [name, setName] = useState("");
  useEffect(() => {
    let active = true;
    getDocumentInfo(id)
      .then((info) => {
        if (active) setName(info.fileName ?? "");
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [id]);
  return <DocumentViewer document={{ id, name: name || t("professional.document", { number }) }} load={loadProfessionalDocument} />;
}

export default function Review({ id }: { id: string }) {
  const { t } = useTranslation("deeplink");
  const [submission, setSubmission] = useState<ProfessionalSubmission | null>(null);
  const [reason, setReason] = useState("");
  const { t: reviewT } = useTranslation("reviewPanel");
  const [choice, setChoice] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getSubmission(id)
      .then((result) => {
        if (active) setSubmission(result);
      })
      .catch(() => {
        if (active) setError(t("errors.UNAVAILABLE"));
      });
    return () => {
      active = false;
    };
  }, [id, t]);
  async function decide(approved: boolean) {
    if (!submission || busy || reason.trim().length < 1) return;
    setBusy(true);
    setError("");
    try {
      setSubmission(await decideSubmission(id, submission.revision, approved, reason.trim()));
      setChoice(null);
      notify(reviewT(approved ? "approved" : "rejected"));
    } catch {
      setError(t("review.conflict"));
    } finally {
      setBusy(false);
    }
  }
  return (
    <OperationalPage title={t("review.title")} centered sideBackground loading={!submission && !error}>
      {choice !== null && submission && (
        <Confirmation
          title={reviewT(choice ? "confirmApprove" : "confirmReject")}
          message={reviewT("confirmMessage", { name: submission.snapshot.name })}
          busy={busy}
          onCancel={() => setChoice(null)}
          onConfirm={() => void decide(choice)}
        />
      )}
      {error && <p role="alert">{error}</p>}
      {submission && (
        <div className="flex flex-col gap-5">
          <p>{t(`status.${submission.status}`, { defaultValue: submission.status })}</p>
          <Surface>
            <div className="scrollbar-none overflow-auto">
              <table className="w-full text-left text-body [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-medium [&_td]:px-4 [&_td]:py-4 [&_tr:not(:last-child)]:border-b [&_tr]:border-operational-border">
                <thead>
                  <tr>
                    <th>{t("review.field")}</th>
                    <th>{t("review.approved")}</th>
                    <th>{t("review.proposed")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(["name", "cpf", "birthDate", "professionId", "council", "registrationNumber", "registrationExpiration"] as const).map((field) => (
                    <tr key={field}>
                      <th>{t(`fields.${field}`)}</th>
                      <td>{submission.approved?.[field] ?? ""}</td>
                      <td>{submission.snapshot[field] ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Surface>
          <ul>
            {submission.validation.criteriaResults?.map((result) => (
              <li key={result.code}>
                {t(`criteria.${result.code}`, { defaultValue: result.code })}: {t(`status.${result.result}`, { defaultValue: result.result })} —{" "}
                {result.reason}
              </li>
            ))}
          </ul>
          {!submission.policy.configured && <p>{t("professional.manualPolicy")}</p>}
          <div className="grid gap-4 md:grid-cols-2">
            {submission.snapshot.documentIds.map((document, index) => (
              <Evidence key={document} id={document} number={index + 1} />
            ))}
          </div>
          {submission.status === "MANUAL_REVIEW" ? (
            <fieldset disabled={busy} className="flex flex-col gap-3">
              <label>
                {t("review.reason")}
                <Textarea
                  name="reason"
                  placeholder={t("review.reason")}
                  value={reason}
                  maxLength={2000}
                  required
                  onChange={(event) => setReason(event.target.value)}
                  className="w-full"
                />
              </label>
              <PrimaryButton
                disabled={!reason.trim()}
                description={t("review.approve")}
                content={t("review.approve")}
                onClick={() => setChoice(true)}
              />
              <WhiteButton disabled={!reason.trim()} description={t("review.reject")} content={t("review.reject")} onClick={() => setChoice(false)} />
            </fieldset>
          ) : (
            <p>
              {submission.decisionOrigin} · {submission.decidedAt} · {submission.decidedBy} · {submission.decisionReason}
            </p>
          )}
        </div>
      )}
    </OperationalPage>
  );
}
