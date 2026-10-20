import FormError from "@@/feedback/toast/FormError";
import FieldFeedback from "@@/feedback/field-feedback/FieldFeedback";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import OperationalTable from "@@/layout/operational-page/OperationalTable";
import { DetailSection, DetailField } from "@@/layout/operational-page/OperationalDetails";
import StatusField from "@@/ui/status-field/StatusField";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import Textarea from "@@/ui/textarea/Textarea";
import { PrimaryButton, WhiteButton } from "@@/ui/button/Button.presets";
import Dialog from "@@/overlay/dialog/Dialog";
import Confirmation from "@@/overlay/confirmation/Confirmation";
import Alert from "@@/feedback/alert/Alert";
import { notify } from "@@/feedback/toast/Toast.utils";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import { listBrandRequests, cancelBrandRequest, decideBrandRequest } from "../brand.service";
import type { BrandRequest } from "../brand";
export default function BrandRequestsTable({ admin = false }: { admin?: boolean }) {
  const { t, i18n } = useTranslation("brands"),
    { can = () => false } = useActiveContext();
  const [items, setItems] = useState<BrandRequest[] | null>(null),
    [selected, setSelected] = useState<BrandRequest | null>(null),
    [action, setAction] = useState<"approve" | "reject" | "cancel" | null>(null),
    [reason, setReason] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    setItems(await listBrandRequests(admin));
    setError(null);
  }, [admin]);
  useEffect(() => {
    let active = true;
    listBrandRequests(admin)
      .then((r) => {
        if (active) setItems(r);
      })
      .catch(() => {
        if (active) setError(t("serviceError"));
      });
    return () => {
      active = false;
    };
  }, [admin, t]);
  async function finish() {
    if (!selected || !action || busy) return;
    setBusy(true);
    try {
      const updated = action === "cancel" ? await cancelBrandRequest(selected) : await decideBrandRequest(selected, action === "approve", reason);
      setItems((current) => current?.map((r) => (r.id === updated.id ? updated : r)) ?? null);
      setSelected(null);
      notify(t(action === "cancel" ? "cancelled" : "decided"));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("serviceError"));
    } finally {
      setBusy(false);
      setAction(null);
    }
  }
  const reasonError = error === t("reasonRequired");
  return (
    <div className="flex flex-col gap-4">
      {error && !selected && <Alert>{error}</Alert>}
      {error && items === null && (
        <WhiteButton content={t("retry")} description={t("retry")} onClick={() => void reload().catch(() => setError(t("serviceError")))} />
      )}
      <OperationalTable
        label={t("requests")}
        items={items}
        getKey={(r) => r.id}
        empty={t("emptyRequests")}
        onRefresh={reload}
        columns={[
          {
            key: "name",
            label: t("name"),
            value: (r) => r.proposedName,
            render: (r) => (
              <button
                type="button"
                className="cursor-pointer font-medium hover:underline"
                onClick={() => {
                  setSelected(r);
                  setReason("");
                  setError(null);
                }}>
                {r.proposedName}
              </button>
            ),
          },
          { key: "kind", label: t("kind"), render: (r) => t(`kinds.${r.kind}`) },
          {
            key: "date",
            label: t("date"),
            value: (r) => r.createdAt,
            render: (r) => new Intl.DateTimeFormat(i18n.language).format(new Date(r.createdAt)),
          },
          {
            key: "status",
            label: t("status"),
            render: (r) => (
              <StatusField
                state={
                  r.status === "APPROVED" ? "approved" : r.status === "REJECTED" ? "rejected" : r.status === "CANCELLED" ? "cancelled" : "pending"
                }
                label={t(`statuses.${r.status}`)}
              />
            ),
          },
          {
            key: "actions",
            label: "",
            render: (r) => (
              <ToolbarAction
                icon="eye"
                label={t("view")}
                className="h-8! w-10!"
                onClick={() => {
                  setSelected(r);
                  setReason("");
                  setError(null);
                }}
              />
            ),
          },
        ]}
      />
      {selected && (
        <Dialog title={t("requestDetails")} onClose={() => setSelected(null)} busy={busy}>
          <div className="flex flex-col gap-5">
            <DetailSection title={t("submitted")}>
              <DetailField label={t("name")} value={selected.proposedName} />
              <DetailField label={t("kind")} value={t(`kinds.${selected.kind}`)} />
              <DetailField
                label={t("reference")}
                value={
                  selected.proposedReferenceUrl && (
                    <a href={selected.proposedReferenceUrl} target="_blank" rel="noreferrer" className="underline">
                      {selected.proposedReferenceUrl}
                    </a>
                  )
                }
              />
              <DetailField label={t("status")} value={t(`statuses.${selected.status}`)} />
              {selected.decisionReason && <DetailField label={t("reason")} value={selected.decisionReason} />}
            </DetailSection>
            {selected.proposedLogoUrl && <img src={selected.proposedLogoUrl} alt={selected.proposedName} className="h-40 w-full object-contain" />}
            <FormError message={!reasonError ? error : null} />
            {selected.status === "PENDING" &&
              (admin ? (
                <>
                  <label className="flex flex-col gap-2">
                    {t("reason")}
                    <Textarea
                      name="brandDecisionReason"
                      aria-label={t("reason")}
                      aria-invalid={reasonError}
                      aria-describedby={reasonError ? "brand-decision-error" : undefined}
                      maxLength={2000}
                      value={reason}
                      placeholder={t("reasonPlaceholder")}
                      onChange={(e) => {
                        setReason(e.target.value);
                        if (reasonError) setError(null);
                      }}
                      className="w-full"
                    />
                    <FieldFeedback id="brand-decision-error" message={reasonError ? t("reasonRequired") : null} />
                  </label>
                  <div className="flex gap-3">
                    <PrimaryButton content={t("approve")} description={t("approve")} onClick={() => setAction("approve")} />
                    <WhiteButton
                      content={t("reject")}
                      description={t("reject")}
                      onClick={() => {
                        if (!reason.trim()) {
                          setError(t("reasonRequired"));
                          document.querySelector<HTMLTextAreaElement>('[name="brandDecisionReason"]')?.focus();
                        } else setAction("reject");
                      }}
                    />
                  </div>
                </>
              ) : (
                (isAlwaysMockMode() || can("POST /api/brand-requests/{id}/cancel")) && (
                  <WhiteButton content={t("cancelRequest")} description={t("cancelRequest")} onClick={() => setAction("cancel")} />
                )
              ))}
          </div>
        </Dialog>
      )}
      {action && (
        <Confirmation
          title={t(action === "approve" ? "approve" : action === "reject" ? "reject" : "cancelRequest")}
          message={t("confirmAction", { name: selected?.proposedName })}
          busy={busy}
          onCancel={() => setAction(null)}
          onConfirm={() => void finish()}
        />
      )}
    </div>
  );
}
