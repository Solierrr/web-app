import ToolbarAction from "@@/ui/button/ToolbarAction";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import { NativeSelect as Select } from "@@/ui/select/Select";
import Input from "@@/ui/input/Input";
import OperationalForm, { FormSection } from "@@/layout/operational-page/OperationalForm";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import {
  createPerson,
  createProfessionalRegistration,
  createTechnician,
  getProfessions,
  type Profession,
} from "@/features/professionals/professional.onboarding.service";
import { validateCertificates, type CertificateValidationResult } from "@/lib/shared/validation/aiValidation.service";
import { validateCpf } from "@/lib/utils/validation.utils";
import RegistrationStatus from "@/lib/components/feedback/registration-status/RegistrationStatus";
import logger from "@/config/logging/logger";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import {
  clearRegistrationDraft,
  getRegistrationDraft,
  saveRegistrationDraft,
  updateMockProfessionalProfile,
} from "@/features/access/access.onboarding.service";

import Submission from "@/features/professionals/submission/Submission";

export default function ProfessionalOnboarding() {
  return isAlwaysMockMode() ? <LegacyProfessionalOnboarding /> : <Submission />;
}

function LegacyProfessionalOnboarding() {
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const { t } = useTranslation("commons", { keyPrefix: "professionalOnboarding" });
  const [draft] = useState(() => getRegistrationDraft("professional"));
  const [professionId, setProfessionId] = useState(draft.fields.professionId ?? "");
  const [professionsLoading, setProfessionsLoading] = useState(true);
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificateResult, setCertificateResult] = useState<CertificateValidationResult | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    getProfessions()
      .then((result) => {
        if (active) setProfessions(result);
      })
      .catch(() => {
        if (active) setError(t("error"));
      })
      .finally(() => {
        if (active) setProfessionsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [t]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const data = new FormData(event.currentTarget);
    const cpf = String(data.get("cpf") ?? "").replace(/\D/g, "");

    const cpfCheck = validateCpf(cpf);
    if (!isAlwaysMockMode() && !cpfCheck.isValid) {
      setError(cpfCheck.message ?? t("error"));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (isAlwaysMockMode()) {
        await waitForMockService();
        const expirationDate = String(data.get("expirationDate") ?? "");
        updateMockProfessionalProfile({
          name: String(data.get("name") ?? "").trim(),
          email: String(data.get("email") ?? "").trim(),
          phone: String(data.get("phone") ?? "").replace(/\D/g, ""),
          crea: String(data.get("crea") ?? "").trim(),
          profession: professions.find((profession) => profession.id === String(data.get("professionId")))?.name ?? "",
          council: String(data.get("council") ?? "").trim(),
          registrationNumber: String(data.get("number") ?? "").trim(),
          expirationDate,
        });
        clearRegistrationDraft("professional");
        setDone(true);
        return;
      }

      const fields = {
        ...getRegistrationDraft("professional").fields,
        ...Object.fromEntries(Array.from(data.entries()).map(([key, value]) => [key, String(value)])),
      };
      const save = () => saveRegistrationDraft({ ...draft, fields });

      const person = fields.personId
        ? { id: fields.personId }
        : await createPerson({
            name: String(data.get("name")).trim(),
            cpf,
            birthDate: String(data.get("birthDate")),
            contact: {
              email: String(data.get("email") ?? "").trim() || undefined,
              phone: String(data.get("phone") ?? "").replace(/\D/g, "") || undefined,
            },
          });

      fields.personId = person.id;
      save();
      const technician = fields.technicianId
        ? { id: fields.technicianId }
        : await createTechnician({
            personId: person.id,
            crea: String(data.get("crea")).trim(),
          });

      fields.technicianId = technician.id;
      save();
      const certNr10Url = String(data.get("certNr10Url") ?? "").trim();
      const certNr35Url = String(data.get("certNr35Url") ?? "").trim();
      if (certNr10Url && certNr35Url) {
        try {
          setCertificateResult(await validateCertificates(certNr10Url, certNr35Url));
        } catch (validationError) {
          logger.error("Falha ao validar certificados", validationError);
        }
      }

      const expirationDate = String(data.get("expirationDate") ?? "");
      if (!fields.registrationId) {
        const registration = await createProfessionalRegistration({
          technicianId: technician.id,
          professionId: String(data.get("professionId")),
          council: String(data.get("council") ?? "").trim() || undefined,
          number: String(data.get("number") ?? "").trim() || undefined,
          expirationDate: expirationDate ? `${expirationDate}T00:00:00` : undefined,
        });
        fields.registrationId = registration.id;
        save();
      }
      clearRegistrationDraft("professional");
      setDone(true);
    } catch {
      setError(t("error"));
    } finally {
      setSaving(false);
    }
  }

  if (professionsLoading) return <OperationalPage title={t("title")} loading />;

  if (done) {
    return (
      <OperationalPage title={t("resultTitle")} compact form centered formBackground>
        <RegistrationStatus status="PENDING" />
        {certificateResult ? (
          <div className="rounded-small border border-operational-border p-4">
            <p className="font-medium">{certificateResult.status === "ACCEPT" ? t("certificatesValid") : t("certificatesInvalid")}</p>
            <p className="text-body text-operational-muted">{certificateResult.reason}</p>
          </div>
        ) : null}
        <ToolbarAction to={routePaths.ownUserProfile(lang)} content={t("continue")} label={t("continue")} className="min-h-12 w-full" />
      </OperationalPage>
    );
  }

  return (
    <OperationalPage title={t("title")} description={t("description")} compact form centered formBackground>
      <OperationalForm
        plain
        onSubmit={handleSubmit}
        onChange={(event) => {
          const fields = Object.fromEntries(Array.from(new FormData(event.currentTarget).entries()).map(([key, value]) => [key, String(value)]));
          saveRegistrationDraft({ ...draft, fields: { ...getRegistrationDraft("professional").fields, ...fields } });
        }}>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            {t("name")}
            <Input
              aria-label={t("name")}
              placeholder={t("name")}
              defaultValue={draft.fields.name ?? ""}
              name="name"
              maxLength={60}
              required
              className="w-full"
            />
          </label>
          <label className="flex flex-col gap-1">
            {t("cpf")}
            <Input
              aria-label={t("cpf")}
              placeholder={t("cpf")}
              defaultValue={draft.fields.cpf ?? ""}
              name="cpf"
              inputMode="numeric"
              pattern="[0-9.\-]{11,14}"
              required
              className="w-full"
            />
          </label>
          <label className="flex flex-col gap-1">
            {t("birthDate")}
            <Input
              aria-label={t("birthDate")}
              placeholder={t("birthDate")}
              defaultValue={draft.fields.birthDate ?? ""}
              name="birthDate"
              type="date"
              required
              className="w-full"
            />
          </label>
          <label className="flex flex-col gap-1">
            {t("email")}
            <Input
              aria-label={t("email")}
              placeholder={t("email")}
              defaultValue={draft.fields.email ?? ""}
              name="email"
              type="email"
              className="w-full"
            />
          </label>
          <label className="flex flex-col gap-1">
            {t("phone")}
            <Input
              aria-label={t("phone")}
              defaultValue={draft.fields.phone ?? ""}
              name="phone"
              inputMode="numeric"
              placeholder="9XXXXXXXX"
              className="w-full"
            />
          </label>
        </div>
        <FormSection collapsible defaultExpanded={false} title={t("registrationSection")}>
          <label className="flex flex-col gap-1">
            {t("crea")}
            <Input aria-label={t("crea")} placeholder={t("crea")} defaultValue={draft.fields.crea ?? ""} name="crea" required className="w-full" />
          </label>
          <label className="flex flex-col gap-1">
            {t("profession")}
            <Select
              aria-label={t("profession")}
              value={professionId}
              onChange={(event) => setProfessionId(event.target.value)}
              name="professionId"
              required
              className="w-full">
              <option value="" disabled>
                {t("professionPlaceholder")}
              </option>
              {professions.map((profession) => (
                <option key={profession.id} value={profession.id}>
                  {profession.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="flex flex-col gap-1">
            {t("council")}
            <Input
              aria-label={t("council")}
              placeholder={t("council")}
              defaultValue={draft.fields.council ?? ""}
              name="council"
              maxLength={60}
              className="w-full"
            />
          </label>
          <label className="flex flex-col gap-1">
            {t("number")}
            <Input
              aria-label={t("number")}
              placeholder={t("number")}
              defaultValue={draft.fields.number ?? ""}
              name="number"
              maxLength={30}
              className="w-full"
            />
          </label>
          <label className="flex flex-col gap-1">
            {t("expirationDate")}
            <Input
              aria-label={t("expirationDate")}
              placeholder={t("expirationDate")}
              defaultValue={draft.fields.expirationDate ?? ""}
              name="expirationDate"
              type="date"
              className="w-full"
            />
          </label>
        </FormSection>
        <FormSection collapsible defaultExpanded={false} title={t("certificatesSection")}>
          <p className="text-body text-operational-muted">{t("certificatesDescription")}</p>
          <label className="flex flex-col gap-1">
            {t("certNr10")}
            <Input
              aria-label={t("certNr10")}
              defaultValue={draft.fields.certNr10Url ?? ""}
              name="certNr10Url"
              type="url"
              placeholder="https://"
              className="w-full"
            />
          </label>
          <label className="flex flex-col gap-1">
            {t("certNr35")}
            <Input
              aria-label={t("certNr35")}
              defaultValue={draft.fields.certNr35Url ?? ""}
              name="certNr35Url"
              type="url"
              placeholder="https://"
              className="w-full"
            />
          </label>
        </FormSection>
        {error ? (
          <p role="alert" className="text-feedback-error">
            {error}
          </p>
        ) : null}
        <PrimaryButton type="submit" disabled={saving} className="min-h-12 w-full" content={t("submit")} description={t("submit")} />
      </OperationalForm>
    </OperationalPage>
  );
}
