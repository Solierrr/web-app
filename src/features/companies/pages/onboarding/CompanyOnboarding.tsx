import { useState, type FormEvent } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import {
  attachCompanyAddress,
  attachCompanyBusinessContact,
  createAddress,
  createBusinessContact,
  createCompany,
  createCompanyPosition,
  createUserCompany,
  findAdminPosition,
} from "@/features/companies/company.service";
import { getMyUser } from "@/features/users/user/user.service";
import { validateCnpj } from "@/utils/validation.utils";
import { validateCnpjCategory, type CnpjValidationResult } from "@/shared/validation/aiValidation.service";
import RegistrationStatus, { type RegistrationStatusKind } from "@/components/feedback/registration-status/RegistrationStatus";
import logger from "@/config/logging/logger";

type CompanyType = "SUPPLIER" | "DEMANDANT";

interface Result {
  status: RegistrationStatusKind;
  categoryCheck?: CnpjValidationResult;
}

export default function CompanyOnboarding() {
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const location = useLocation();
  const suggestedType = (location.state as { suggestedType?: string } | null)?.suggestedType;
  const { t } = useTranslation("commons", { keyPrefix: "companyOnboarding" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const type = String(data.get("type")) as CompanyType;
    const cnpj = String(data.get("cnpj") ?? "").replace(/\D/g, "");

    const cnpjCheck = validateCnpj(cnpj);
    if (!cnpjCheck.isValid) {
      setError(cnpjCheck.message ?? t("error"));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const myUser = await getMyUser();

      const company = await createCompany({
        type,
        cnpj,
        tradeName: String(data.get("tradeName")).trim(),
        corporateName: String(data.get("corporateName")).trim(),
      });

      const address = await createAddress({
        state: String(data.get("state")).trim().toUpperCase(),
        city: String(data.get("city")).trim(),
        neighborhood: String(data.get("neighborhood") ?? "").trim() || undefined,
        zipCode: String(data.get("zipCode") ?? "").replace(/\D/g, ""),
        street: String(data.get("street")).trim(),
        number: String(data.get("number") ?? "").trim() || undefined,
      });
      await attachCompanyAddress(company.id, address.id);

      const businessContact = await createBusinessContact({
        companyEmail: String(data.get("companyEmail")).trim(),
        phone: String(data.get("phone") ?? "").replace(/\D/g, "") || undefined,
        website: String(data.get("website") ?? "").trim() || undefined,
      });
      await attachCompanyBusinessContact(company.id, businessContact.id);

      const adminPosition = await findAdminPosition();
      await createCompanyPosition(company.id, adminPosition.id);
      await createUserCompany(company.id, myUser.id, adminPosition.id);

      let categoryCheck: CnpjValidationResult | undefined;
      if (type === "SUPPLIER") {
        try {
          categoryCheck = await validateCnpjCategory(cnpj);
        } catch (validationError) {
          // Validação interpretativa indisponível não bloqueia o cadastro — vai para análise manual.
          logger.error("Falha ao validar categoria do CNPJ", validationError);
        }
      }

      setResult({
        status: company.status === "APPROVED" ? "APPROVED" : company.status === "REJECTED" ? "REJECTED" : "PENDING",
        categoryCheck,
      });
    } catch {
      setError(t("error"));
    } finally {
      setSaving(false);
    }
  }

  if (result) {
    return (
      <main className="mx-auto flex max-w-xl flex-col gap-4 p-6">
        <h1 className="text-2xl font-semibold">{t("resultTitle")}</h1>
        <RegistrationStatus status={result.status} />
        {result.categoryCheck ? (
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="font-medium">
              {result.categoryCheck.status === "VALID" ? t("categoryValid") : t("categoryInvalid")}
            </p>
            <p className="text-sm text-gray-600">{result.categoryCheck.reason}</p>
          </div>
        ) : null}
        <Link to={routePaths.ownCompanyProfile(lang)} className="w-fit rounded-lg bg-orange px-5 py-2 text-white">
          {t("continue")}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-2 text-2xl font-semibold">{t("title")}</h1>
      <p className="mb-6 text-gray-600">{t("description")}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">{t("type")}
          <select name="type" defaultValue={suggestedType === "DEMANDANT" ? "DEMANDANT" : "SUPPLIER"} required className="rounded-lg border border-gray-300 p-2">
            <option value="SUPPLIER">{t("supplier")}</option>
            <option value="DEMANDANT">{t("demandant")}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">{t("cnpj")}
          <input name="cnpj" inputMode="numeric" pattern="[0-9.\-/]{14,18}" required className="rounded-lg border border-gray-300 p-2" />
        </label>
        <label className="flex flex-col gap-1">{t("tradeName")}
          <input name="tradeName" maxLength={120} required className="rounded-lg border border-gray-300 p-2" />
        </label>
        <label className="flex flex-col gap-1">{t("corporateName")}
          <input name="corporateName" maxLength={120} required className="rounded-lg border border-gray-300 p-2" />
        </label>

        <h2 className="mt-2 font-medium">{t("addressSection")}</h2>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">{t("zipCode")}
            <input name="zipCode" inputMode="numeric" pattern="\d{8}" required className="rounded-lg border border-gray-300 p-2" />
          </label>
          <label className="flex flex-col gap-1">{t("state")}
            <input name="state" maxLength={2} required className="rounded-lg border border-gray-300 p-2 uppercase" />
          </label>
          <label className="flex flex-col gap-1">{t("city")}
            <input name="city" required className="rounded-lg border border-gray-300 p-2" />
          </label>
          <label className="flex flex-col gap-1">{t("neighborhood")}
            <input name="neighborhood" className="rounded-lg border border-gray-300 p-2" />
          </label>
          <label className="col-span-2 flex flex-col gap-1">{t("street")}
            <input name="street" required className="rounded-lg border border-gray-300 p-2" />
          </label>
          <label className="flex flex-col gap-1">{t("number")}
            <input name="number" maxLength={10} className="rounded-lg border border-gray-300 p-2" />
          </label>
        </div>

        <h2 className="mt-2 font-medium">{t("contactSection")}</h2>
        <label className="flex flex-col gap-1">{t("companyEmail")}
          <input name="companyEmail" type="email" required className="rounded-lg border border-gray-300 p-2" />
        </label>
        <label className="flex flex-col gap-1">{t("phone")}
          <input name="phone" inputMode="numeric" placeholder="9XXXXXXXX" className="rounded-lg border border-gray-300 p-2" />
        </label>
        <label className="flex flex-col gap-1">{t("website")}
          <input name="website" type="url" placeholder="https://" className="rounded-lg border border-gray-300 p-2" />
        </label>

        {error ? <p role="alert" className="text-red-700">{error}</p> : null}
        <button type="submit" disabled={saving} className="rounded-lg bg-orange px-5 py-2 text-white disabled:opacity-50">
          {t("submit")}
        </button>
      </form>
    </main>
  );
}
