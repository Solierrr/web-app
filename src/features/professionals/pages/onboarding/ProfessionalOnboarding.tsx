import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { getMyUser } from "@/features/users/user/user.service";
import {
  createContact,
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

export default function ProfessionalOnboarding() {
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const { t } = useTranslation("commons", { keyPrefix: "professionalOnboarding" });
  const [draft] = useState(() => getRegistrationDraft("professional"));
  const [professionId, setProfessionId] = useState(draft.fields.professionId ?? "");
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
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

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
      const myUser = await getMyUser();

      const contact = fields.contactId
        ? { id: fields.contactId }
        : await createContact({
            email: String(data.get("email") ?? "").trim() || undefined,
            phone: String(data.get("phone") ?? "").replace(/\D/g, "") || undefined,
          });

      fields.contactId = contact.id;
      save();
      const person = fields.personId
        ? { id: fields.personId }
        : await createPerson({
            userId: myUser.id,
            contactId: contact.id,
            name: String(data.get("name")).trim(),
            cpf,
            birthDate: String(data.get("birthDate")),
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

  if (done) {
    return (
      <OperationalPage title={t("resultTitle")} compact>
        <RegistrationStatus status="PENDING" />
        {certificateResult ? (
          <div className="rounded-small border border-operational-border p-4">
            <p className="font-medium">{certificateResult.status === "ACCEPT" ? t("certificatesValid") : t("certificatesInvalid")}</p>
            <p className="text-sm text-gray-600">{certificateResult.reason}</p>
          </div>
        ) : null}
        <Link to={routePaths.ownUserProfile(lang)} className="w-fit rounded-small bg-orange px-5 py-2 text-white">
          {t("continue")}
        </Link>
      </OperationalPage>
    );
  }

  return (
    <OperationalPage title={t("title")} description={t("description")} compact>
      <form
        onSubmit={handleSubmit}
        onChange={(event) => {
          const fields = Object.fromEntries(Array.from(new FormData(event.currentTarget).entries()).map(([key, value]) => [key, String(value)]));
          saveRegistrationDraft({ ...draft, fields: { ...getRegistrationDraft("professional").fields, ...fields } });
        }}
        className="flex flex-col gap-4">
        <h2 className="font-medium">{t("personalSection")}</h2>
        <label className="flex flex-col gap-1">
          {t("name")}
          <input
            defaultValue={draft.fields.name ?? ""}
            name="name"
            maxLength={60}
            required
            className="rounded-small border border-operational-border p-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          {t("cpf")}
          <input
            defaultValue={draft.fields.cpf ?? ""}
            name="cpf"
            inputMode="numeric"
            pattern="[0-9.\-]{11,14}"
            required
            className="rounded-small border border-operational-border p-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          {t("birthDate")}
          <input
            defaultValue={draft.fields.birthDate ?? ""}
            name="birthDate"
            type="date"
            required
            className="rounded-small border border-operational-border p-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          {t("email")}
          <input defaultValue={draft.fields.email ?? ""} name="email" type="email" className="rounded-small border border-operational-border p-2" />
        </label>
        <label className="flex flex-col gap-1">
          {t("phone")}
          <input
            defaultValue={draft.fields.phone ?? ""}
            name="phone"
            inputMode="numeric"
            placeholder="9XXXXXXXX"
            className="rounded-small border border-operational-border p-2"
          />
        </label>

        <h2 className="mt-2 font-medium">{t("registrationSection")}</h2>
        <label className="flex flex-col gap-1">
          {t("crea")}
          <input defaultValue={draft.fields.crea ?? ""} name="crea" required className="rounded-small border border-operational-border p-2" />
        </label>
        <label className="flex flex-col gap-1">
          {t("profession")}
          <select
            value={professionId}
            onChange={(event) => setProfessionId(event.target.value)}
            name="professionId"
            required
            className="rounded-small border border-operational-border p-2">
            <option value="" disabled>
              {t("professionPlaceholder")}
            </option>
            {professions.map((profession) => (
              <option key={profession.id} value={profession.id}>
                {profession.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          {t("council")}
          <input
            defaultValue={draft.fields.council ?? ""}
            name="council"
            maxLength={60}
            className="rounded-small border border-operational-border p-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          {t("number")}
          <input
            defaultValue={draft.fields.number ?? ""}
            name="number"
            maxLength={30}
            className="rounded-small border border-operational-border p-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          {t("expirationDate")}
          <input
            defaultValue={draft.fields.expirationDate ?? ""}
            name="expirationDate"
            type="date"
            className="rounded-small border border-operational-border p-2"
          />
        </label>

        <h2 className="mt-2 font-medium">{t("certificatesSection")}</h2>
        <p className="text-sm text-gray-600">{t("certificatesDescription")}</p>
        <label className="flex flex-col gap-1">
          {t("certNr10")}
          <input
            defaultValue={draft.fields.certNr10Url ?? ""}
            name="certNr10Url"
            type="url"
            placeholder="https://"
            className="rounded-small border border-operational-border p-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          {t("certNr35")}
          <input
            defaultValue={draft.fields.certNr35Url ?? ""}
            name="certNr35Url"
            type="url"
            placeholder="https://"
            className="rounded-small border border-operational-border p-2"
          />
        </label>

        {error ? (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={saving} className="rounded-small bg-orange px-5 py-2 text-white disabled:opacity-50">
          {t("submit")}
        </button>
      </form>
    </OperationalPage>
  );
}
