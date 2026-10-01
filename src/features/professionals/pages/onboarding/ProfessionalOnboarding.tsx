import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { getMyUser } from "@/features/users/user/user.service";
import {
  createContact,
  createPerson,
  createProfessionalRegistration,
  createTechnician,
  getProfessions,
  type Profession,
} from "@/features/professionals/professionalOnboarding.service";
import { validateCertificates, type CertificateValidationResult } from "@/shared/validation/aiValidation.service";
import { validateCpf } from "@/utils/validation.utils";
import RegistrationStatus from "@/components/feedback/registration-status/RegistrationStatus";
import logger from "@/config/logging/logger";

export default function ProfessionalOnboarding() {
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const { t } = useTranslation("commons", { keyPrefix: "professionalOnboarding" });
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
    const data = new FormData(event.currentTarget);
    const cpf = String(data.get("cpf") ?? "").replace(/\D/g, "");

    const cpfCheck = validateCpf(cpf);
    if (!cpfCheck.isValid) {
      setError(cpfCheck.message ?? t("error"));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const myUser = await getMyUser();

      const contact = await createContact({
        email: String(data.get("email") ?? "").trim() || undefined,
        phone: String(data.get("phone") ?? "").replace(/\D/g, "") || undefined,
      });

      const person = await createPerson({
        userId: myUser.id,
        contactId: contact.id,
        name: String(data.get("name")).trim(),
        cpf,
        birthDate: String(data.get("birthDate")),
      });

      const technician = await createTechnician({
        personId: person.id,
        crea: String(data.get("crea")).trim(),
      });

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
      await createProfessionalRegistration({
        technicianId: technician.id,
        professionId: String(data.get("professionId")),
        council: String(data.get("council") ?? "").trim() || undefined,
        number: String(data.get("number") ?? "").trim() || undefined,
        expirationDate: expirationDate ? `${expirationDate}T00:00:00` : undefined,
      });

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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h2 className="font-medium">{t("personalSection")}</h2>
        <label className="flex flex-col gap-1">
          {t("name")}
          <input name="name" maxLength={60} required className="rounded-small border border-operational-border p-2" />
        </label>
        <label className="flex flex-col gap-1">
          {t("cpf")}
          <input name="cpf" inputMode="numeric" pattern="[0-9.\-]{11,14}" required className="rounded-small border border-operational-border p-2" />
        </label>
        <label className="flex flex-col gap-1">
          {t("birthDate")}
          <input name="birthDate" type="date" required className="rounded-small border border-operational-border p-2" />
        </label>
        <label className="flex flex-col gap-1">
          {t("email")}
          <input name="email" type="email" className="rounded-small border border-operational-border p-2" />
        </label>
        <label className="flex flex-col gap-1">
          {t("phone")}
          <input name="phone" inputMode="numeric" placeholder="9XXXXXXXX" className="rounded-small border border-operational-border p-2" />
        </label>

        <h2 className="mt-2 font-medium">{t("registrationSection")}</h2>
        <label className="flex flex-col gap-1">
          {t("crea")}
          <input name="crea" required className="rounded-small border border-operational-border p-2" />
        </label>
        <label className="flex flex-col gap-1">
          {t("profession")}
          <select name="professionId" required className="rounded-small border border-operational-border p-2">
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
          <input name="council" maxLength={60} className="rounded-small border border-operational-border p-2" />
        </label>
        <label className="flex flex-col gap-1">
          {t("number")}
          <input name="number" maxLength={30} className="rounded-small border border-operational-border p-2" />
        </label>
        <label className="flex flex-col gap-1">
          {t("expirationDate")}
          <input name="expirationDate" type="date" className="rounded-small border border-operational-border p-2" />
        </label>

        <h2 className="mt-2 font-medium">{t("certificatesSection")}</h2>
        <p className="text-sm text-gray-600">{t("certificatesDescription")}</p>
        <label className="flex flex-col gap-1">
          {t("certNr10")}
          <input name="certNr10Url" type="url" placeholder="https://" className="rounded-small border border-operational-border p-2" />
        </label>
        <label className="flex flex-col gap-1">
          {t("certNr35")}
          <input name="certNr35Url" type="url" placeholder="https://" className="rounded-small border border-operational-border p-2" />
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
