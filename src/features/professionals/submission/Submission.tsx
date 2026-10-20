import FormError from "@@/feedback/toast/FormError";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import OperationalForm, { FormSection } from "@@/layout/operational-page/OperationalForm";
import Input from "@@/ui/input/Input";
import { NativeSelect } from "@@/ui/select/Select";
import { PrimaryButton, WhiteButton } from "@@/ui/button/Button.presets";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import FileInput from "@@/ui/file-input/FileInput";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { getProfessions, type Profession } from "../professional.onboarding.service";
import {
  getProfessionalAccount,
  getProfessionalPolicy,
  saveProfessionalDraft,
  submitProfessional,
  uploadProfessionalDocument,
} from "../professional.submission.service";
import type { ProfessionalAccount, ProfessionalDraft, ProfessionalPolicy } from "../professional.submission";

const emptyDraft: ProfessionalDraft = {
  revision: 0,
  name: "",
  cpf: "",
  birthDate: "",
  email: "",
  phone: "",
  professionId: "",
  council: null,
  registrationNumber: null,
  registrationExpiration: null,
  documentIds: [],
};
const fields = ["name", "cpf", "birthDate", "email", "phone", "council", "registrationNumber", "registrationExpiration"] as const;

export default function Submission() {
  const { t } = useTranslation("deeplink");
  const [account, setAccount] = useState<ProfessionalAccount | null>(null);
  const [draft, setDraft] = useState<ProfessionalDraft>(emptyDraft);
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [policy, setPolicy] = useState<ProfessionalPolicy | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = account?.submissions.some((item) => ["QUEUED", "VALIDATING", "RETRY_PENDING", "MANUAL_REVIEW"].includes(item.status));

  function accept(result: ProfessionalAccount) {
    setAccount(result);
    setDraft({ ...emptyDraft, ...result.draft, revision: result.revision, documentIds: result.draft.documentIds ?? [] });
  }
  useEffect(() => {
    let active = true;
    Promise.all([getProfessionalAccount(), getProfessions()])
      .then(([result, choices]) => {
        if (active) {
          accept(result);
          setProfessions(choices);
        }
      })
      .catch(() => {
        if (active) setError(t("errors.UNAVAILABLE"));
      });
    return () => {
      active = false;
    };
  }, [t]);
  useEffect(() => {
    if (!draft.professionId) return;
    let active = true;
    getProfessionalPolicy(draft.professionId)
      .then((result) => {
        if (active) setPolicy(result);
      })
      .catch(() => {
        if (active) setError(t("errors.UNAVAILABLE"));
      });
    return () => {
      active = false;
    };
  }, [draft.professionId, t]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || pending) return;
    setBusy(true);
    setError("");
    const submit = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "submit";
    try {
      const result = await saveProfessionalDraft({ ...draft, revision: account?.revision ?? 0 });
      accept(result);
      if (submit) {
        await submitProfessional(result.revision);
        accept(await getProfessionalAccount());
      }
    } catch {
      setError(t("professional.saveError"));
    } finally {
      setBusy(false);
    }
  }
  async function upload(kind: string, file?: File) {
    if (!file || busy || pending) return;
    setBusy(true);
    setError("");
    try {
      const document = await uploadProfessionalDocument(kind, file);
      setDraft((current) => ({ ...current, documentIds: [...current.documentIds, document.id] }));
    } catch {
      setError(t("professional.fileError"));
    } finally {
      setBusy(false);
    }
  }
  async function reload() {
    setBusy(true);
    try {
      accept(await getProfessionalAccount());
      setError("");
    } catch {
      setError(t("errors.UNAVAILABLE"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <OperationalPage title={t("professional.title")} compact form centered formBackground loading={!account && !error}>
      <OperationalForm plain onSubmit={(event) => void save(event)} className="flex flex-col gap-5">
        <FormError message={error} />
        {account?.approved && <p role="status">{t("professional.preserved")}</p>}
        {account?.suspended && <p role="alert">{t("professional.suspended")}</p>}
        {account?.submissions.map((item) => (
          <article key={item.id} className="rounded-surface border-ui bg-white p-5 shadow-surface">
            <p>{t(`status.${item.status}`, { defaultValue: item.status })}</p>
            {item.decisionReason && <p>{item.decisionReason}</p>}
          </article>
        ))}
        <ToolbarAction
          icon="refresh"
          label={t("professional.refresh")}
          content={t("professional.refresh")}
          disabled={busy}
          onClick={() => void reload()}
        />
        <fieldset disabled={busy || pending || !account} className="flex flex-col gap-4">
          {fields
            .filter((field) => !["council", "registrationNumber", "registrationExpiration"].includes(field))
            .map((field) => (
              <label key={field} className="flex flex-col gap-1">
                {t(`fields.${field}`)}
                <Input
                  name={field}
                  aria-label={t(`fields.${field}`)}
                  placeholder={t(`fields.${field}`)}
                  type={field === "birthDate" || field === "registrationExpiration" ? "date" : field === "email" ? "email" : "text"}
                  maxLength={field === "cpf" ? 11 : field === "phone" ? 12 : field === "name" ? 60 : 100}
                  value={draft[field] ?? ""}
                  onChange={(event) => setDraft({ ...draft, [field]: event.target.value || null })}
                  required={["name", "cpf", "birthDate", "email", "phone"].includes(field)}
                />
              </label>
            ))}
          <label className="flex flex-col gap-1">
            {t("fields.professionId")}
            <NativeSelect
              name="professionId"
              value={draft.professionId}
              required
              onChange={(event) => {
                setPolicy(null);
                setDraft({ ...draft, professionId: event.target.value });
              }}>
              <option value="">{t("professional.choose")}</option>
              {professions.map((profession) => (
                <option key={profession.id} value={profession.id}>
                  {profession.name}
                </option>
              ))}
            </NativeSelect>
          </label>
          <FormSection title={t("fields.registrationNumber")} collapsible defaultExpanded={false}>
            {(["council", "registrationNumber", "registrationExpiration"] as const).map((field) => (
              <label key={field} className="flex flex-col gap-2">
                {t(`fields.${field}`)}
                <Input
                  name={field}
                  aria-label={t(`fields.${field}`)}
                  type={field === "registrationExpiration" ? "date" : "text"}
                  placeholder={t(`fields.${field}`)}
                  maxLength={100}
                  value={draft[field] ?? ""}
                  onChange={(event) => setDraft({ ...draft, [field]: event.target.value || null })}
                />
              </label>
            ))}
          </FormSection>
          <FormSection title={t("professional.documents", { count: draft.documentIds.length })} collapsible defaultExpanded={false}>
            {policy && !policy.configured && <p>{t("professional.manualPolicy")}</p>}
            <p>{t("professional.documents", { count: draft.documentIds.length })}</p>
            {draft.documentIds.map((id, index) => (
              <div key={id}>
                <span>{t("professional.document", { number: index + 1 })}</span>
                <ToolbarAction
                  icon="trash"
                  label={t("professional.remove")}
                  onClick={() => setDraft({ ...draft, documentIds: draft.documentIds.filter((item) => item !== id) })}
                />
              </div>
            ))}
            {[...new Set([...(policy?.requiredDocuments ?? ["IDENTITY"]), "CERTIFICATE"])].map((kind) => (
              <FileInput
                key={kind}
                name={kind}
                label={t(`documents.${kind}`)}
                maxBytes={10 * 1024 * 1024}
                disabled={busy || pending || draft.documentIds.length >= 10}
                invalidMessage={t("professional.fileError")}
                onError={(message) => setError(message ?? "")}
                allowedTypes={[
                  "image/jpeg",
                  "image/png",
                  "image/webp",
                  "application/pdf",
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ]}
                onChange={(file) => void upload(kind, file)}
              />
            ))}
            <p>{t("professional.optional")}</p>
          </FormSection>
          <WhiteButton className="min-h-12 w-full" type="submit" value="save" description={t("professional.save")} content={t("professional.save")} />
          <PrimaryButton
            className="min-h-12 w-full"
            type="submit"
            value="submit"
            disabled={!policy}
            description={t("professional.submit")}
            content={t("professional.submit")}
          />
        </fieldset>
      </OperationalForm>
    </OperationalPage>
  );
}
