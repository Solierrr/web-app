import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useState, type FormEvent } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import {
  attachCompanyAddress,
  attachCompanyBusinessContact,
  createAddress,
  createBusinessContact,
  createCompany,
} from "@/features/companies/company.service";
import { validateCnpj } from "@/lib/utils/validation.utils";
import { validateCnpjCategory, type CnpjValidationResult } from "@/lib/shared/validation/aiValidation.service";
import RegistrationStatus, { type RegistrationStatusKind } from "@/lib/components/feedback/registration-status/RegistrationStatus";
import logger from "@/config/logging/logger";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import {
  addOperationalMembership,
  clearRegistrationDraft,
  getRegistrationDraft,
  saveRegistrationDraft,
  selectContext,
} from "@/features/access/access.onboarding.service";

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
  const [draft] = useState(() => getRegistrationDraft("company"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const data = new FormData(event.currentTarget);
    const type = String(data.get("type")) as CompanyType;
    const cnpj = String(data.get("cnpj") ?? "").replace(/\D/g, "");

    const cnpjCheck = validateCnpj(cnpj);
    if (!isAlwaysMockMode() && !cnpjCheck.isValid) {
      setError(cnpjCheck.message ?? t("error"));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const fields = {
        ...getRegistrationDraft("company").fields,
        ...Object.fromEntries(Array.from(data.entries()).map(([key, value]) => [key, String(value)])),
      };
      const save = () => saveRegistrationDraft({ ...draft, fields });
      if (isAlwaysMockMode()) {
        await waitForMockService();
        const id = fields.companyId || crypto.randomUUID();
        addOperationalMembership({
          id,
          name: fields.tradeName,
          type,
          admin: true,
          companyProfile: {
            cnpj,
            corporateName: fields.corporateName,
            companyEmail: fields.companyEmail,
            phone: fields.phone ?? "",
            website: fields.website ?? "",
            street: fields.street,
            number: fields.number ?? "",
            neighborhood: fields.neighborhood ?? "",
            city: fields.city,
            state: fields.state.toUpperCase(),
            zipCode: fields.zipCode,
          },
        });
        selectContext(id);
        clearRegistrationDraft("company");
        setResult({ status: "APPROVED" });
        return;
      }
      const company = fields.companyId
        ? { id: fields.companyId, status: "PENDING" }
        : await createCompany({
            type,
            cnpj,
            tradeName: String(data.get("tradeName")).trim(),
            corporateName: String(data.get("corporateName")).trim(),
          });

      fields.companyId = company.id;
      save();
      const address = fields.addressId
        ? { id: fields.addressId }
        : await createAddress({
            state: String(data.get("state")).trim().toUpperCase(),
            city: String(data.get("city")).trim(),
            neighborhood: String(data.get("neighborhood") ?? "").trim() || undefined,
            zipCode: String(data.get("zipCode") ?? "").replace(/\D/g, ""),
            street: String(data.get("street")).trim(),
            number: String(data.get("number") ?? "").trim() || undefined,
          });
      fields.addressId = address.id;
      save();
      await attachCompanyAddress(company.id, address.id);

      const businessContact = fields.businessContactId
        ? { id: fields.businessContactId }
        : await createBusinessContact({
            companyEmail: String(data.get("companyEmail")).trim(),
            phone: String(data.get("phone") ?? "").replace(/\D/g, "") || undefined,
            website: String(data.get("website") ?? "").trim() || undefined,
          });
      fields.businessContactId = businessContact.id;
      save();
      await attachCompanyBusinessContact(company.id, businessContact.id);

      let categoryCheck: CnpjValidationResult | undefined;
      if (type === "SUPPLIER") {
        try {
          categoryCheck = await validateCnpjCategory(cnpj);
        } catch (validationError) {
          // Validação interpretativa indisponível não bloqueia o cadastro — vai para análise manual.
          logger.error("Falha ao validar categoria do CNPJ", validationError);
        }
      }

      clearRegistrationDraft("company");
      selectContext(company.id);
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
      <OperationalPage title={t("resultTitle")} compact>
        <RegistrationStatus status={result.status} />
        {result.categoryCheck ? (
          <div className="rounded-small border border-operational-border p-4">
            <p className="font-medium">{result.categoryCheck.status === "VALID" ? t("categoryValid") : t("categoryInvalid")}</p>
            <p className="text-sm text-gray-600">{result.categoryCheck.reason}</p>
          </div>
        ) : null}
        <Link to={routePaths.ownCompanyProfile(lang)} className="w-fit rounded-small bg-orange px-5 py-2 text-white">
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
          saveRegistrationDraft({ ...draft, fields: { ...getRegistrationDraft("company").fields, ...fields } });
        }}
        className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          {t("type")}
          <select
            name="type"
            defaultValue={draft.fields.type ?? (suggestedType === "DEMANDANT" ? "DEMANDANT" : "SUPPLIER")}
            required
            className="rounded-small border border-operational-border p-2">
            <option value="SUPPLIER">{t("supplier")}</option>
            <option value="DEMANDANT">{t("demandant")}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          {t("cnpj")}
          <input
            defaultValue={draft.fields.cnpj ?? ""}
            name="cnpj"
            inputMode="numeric"
            pattern="[0-9.\-/]{14,18}"
            required
            className="rounded-small border border-operational-border p-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          {t("tradeName")}
          <input
            defaultValue={draft.fields.tradeName ?? ""}
            name="tradeName"
            maxLength={120}
            required
            className="rounded-small border border-operational-border p-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          {t("corporateName")}
          <input
            defaultValue={draft.fields.corporateName ?? ""}
            name="corporateName"
            maxLength={120}
            required
            className="rounded-small border border-operational-border p-2"
          />
        </label>

        <h2 className="mt-2 font-medium">{t("addressSection")}</h2>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            {t("zipCode")}
            <input
              defaultValue={draft.fields.zipCode ?? ""}
              name="zipCode"
              inputMode="numeric"
              pattern="\d{8}"
              required
              className="rounded-small border border-operational-border p-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            {t("state")}
            <input
              defaultValue={draft.fields.state ?? ""}
              name="state"
              maxLength={2}
              required
              className="rounded-small border border-operational-border p-2 uppercase"
            />
          </label>
          <label className="flex flex-col gap-1">
            {t("city")}
            <input defaultValue={draft.fields.city ?? ""} name="city" required className="rounded-small border border-operational-border p-2" />
          </label>
          <label className="flex flex-col gap-1">
            {t("neighborhood")}
            <input
              defaultValue={draft.fields.neighborhood ?? ""}
              name="neighborhood"
              className="rounded-small border border-operational-border p-2"
            />
          </label>
          <label className="col-span-2 flex flex-col gap-1">
            {t("street")}
            <input defaultValue={draft.fields.street ?? ""} name="street" required className="rounded-small border border-operational-border p-2" />
          </label>
          <label className="flex flex-col gap-1">
            {t("number")}
            <input
              defaultValue={draft.fields.number ?? ""}
              name="number"
              maxLength={10}
              className="rounded-small border border-operational-border p-2"
            />
          </label>
        </div>

        <h2 className="mt-2 font-medium">{t("contactSection")}</h2>
        <label className="flex flex-col gap-1">
          {t("companyEmail")}
          <input
            defaultValue={draft.fields.companyEmail ?? ""}
            name="companyEmail"
            type="email"
            required
            className="rounded-small border border-operational-border p-2"
          />
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
        <label className="flex flex-col gap-1">
          {t("website")}
          <input
            defaultValue={draft.fields.website ?? ""}
            name="website"
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
