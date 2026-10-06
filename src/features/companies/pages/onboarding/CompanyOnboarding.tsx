import ToolbarAction from "@@/ui/button/ToolbarAction";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import Input from "@@/ui/input/Input";
import { CepInput, CnpjInput, UfInput } from "@@/ui/input/Input.presets";
import Textarea from "@@/ui/textarea/Textarea";
import Select from "@@/ui/select/Select";
import OperationalForm, { FormSection } from "@@/layout/operational-page/OperationalForm";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { createCompany } from "@/features/companies/company.service";
import { normalizeCnpj, validateCnpj } from "@/lib/utils/validation.utils";
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
  const [companyType, setCompanyType] = useState<CompanyType>(() =>
    draft.fields.type === "SUPPLIER" || draft.fields.type === "DEMANDANT"
      ? draft.fields.type
      : suggestedType === "DEMANDANT"
        ? "DEMANDANT"
        : "SUPPLIER",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const [address, setAddress] = useState(() => ({
    zipCode: draft.fields.zipCode ?? "",
    state: draft.fields.state ?? "",
    city: draft.fields.city ?? "",
    neighborhood: draft.fields.neighborhood ?? "",
    street: draft.fields.street ?? "",
  }));
  const addressRef = useRef(address);
  const lookup = useRef<AbortController | null>(null);
  const [postalStatus, setPostalStatus] = useState<"" | "loading" | "notFound" | "failed">("");
  useEffect(() => () => lookup.current?.abort(), []);

  function updateAddress(next: typeof address) {
    addressRef.current = next;
    setAddress(next);
    saveRegistrationDraft({ ...draft, fields: { ...getRegistrationDraft("company").fields, ...next } });
  }

  async function changeZipCode(zipCode: string) {
    lookup.current?.abort();
    const initial = { ...addressRef.current, zipCode };
    updateAddress(initial);
    setPostalStatus("");
    if (zipCode.length !== 8) return;
    const controller = new AbortController();
    lookup.current = controller;
    setPostalStatus("loading");
    try {
      const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`, { signal: controller.signal });
      if (!response.ok) throw new Error("Postal lookup failed");
      const data = await response.json();
      if (controller.signal.aborted) return;
      if (data.erro) {
        setPostalStatus("notFound");
        return;
      }
      const next = { ...addressRef.current };
      const fields = { state: data.uf, city: data.localidade, neighborhood: data.bairro, street: data.logradouro };
      for (const key of Object.keys(fields) as (keyof typeof fields)[]) {
        if (typeof fields[key] === "string" && fields[key] && next[key] === initial[key]) next[key] = fields[key];
      }
      updateAddress(next);
      setPostalStatus("");
    } catch {
      if (!controller.signal.aborted) setPostalStatus("failed");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const data = new FormData(event.currentTarget);
    const type = String(data.get("type")) as CompanyType;
    const cnpj = normalizeCnpj(String(data.get("cnpj") ?? ""));

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
            zipCode: fields.zipCode.replace(/\D/g, ""),
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
            address: {
              state: String(data.get("state")).trim().toUpperCase(),
              city: String(data.get("city")).trim(),
              neighborhood: String(data.get("neighborhood") ?? "").trim() || undefined,
              zipCode: String(data.get("zipCode") ?? "").replace(/\D/g, ""),
              street: String(data.get("street")).trim(),
              number: String(data.get("number") ?? "").trim() || undefined,
            },
            businessContact: {
              companyEmail: String(data.get("companyEmail")).trim(),
              phone: String(data.get("phone") ?? "").replace(/\D/g, "") || undefined,
              website: String(data.get("website") ?? "").trim() || undefined,
            },
          });

      fields.companyId = company.id;
      save();

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
      <OperationalPage title={t("resultTitle")} compact form centered formBackground>
        <RegistrationStatus status={result.status} />
        {result.categoryCheck ? (
          <div className="rounded-small border border-operational-border p-4">
            <p className="font-medium">{result.categoryCheck.status === "VALID" ? t("categoryValid") : t("categoryInvalid")}</p>
            <p className="text-body text-operational-muted">{result.categoryCheck.reason}</p>
          </div>
        ) : null}
        <ToolbarAction to={routePaths.ownCompanyProfile(lang)} label={t("continue")} content={t("continue")} className="min-h-12 w-full" />
      </OperationalPage>
    );
  }

  return (
    <OperationalPage title={t("title")} description={t("description")} compact form centered formBackground>
      <OperationalForm
        plain
        autoComplete="off"
        onSubmit={handleSubmit}
        onChange={(event) => {
          const fields = Object.fromEntries(Array.from(new FormData(event.currentTarget).entries()).map(([key, value]) => [key, String(value)]));
          saveRegistrationDraft({ ...draft, fields: { ...getRegistrationDraft("company").fields, ...fields } });
        }}>
        <label className="flex flex-col gap-1">
          {t("type")}
          <Select<CompanyType>
            name={t("type")}
            value={companyType}
            clearable={false}
            options={[
              [t("supplier"), "SUPPLIER"],
              [t("demandant"), "DEMANDANT"],
            ]}
            onChange={(value) => {
              if (!value) return;
              setCompanyType(value);
              saveRegistrationDraft({ ...draft, fields: { ...getRegistrationDraft("company").fields, type: value } });
            }}
            className="w-full min-h-12"
          />
          <input type="hidden" name="type" value={companyType} />
        </label>
        <label className="flex flex-col gap-1">
          {t("cnpj")}
          <CnpjInput
            aria-label={t("cnpj")}
            placeholder={t("placeholders.cnpj")}
            defaultValue={normalizeCnpj(draft.fields.cnpj ?? "")}
            name="cnpj"
            required
            className="w-full"
          />
        </label>
        <label className="flex flex-col gap-1">
          {t("tradeName")}
          <Input
            aria-label={t("tradeName")}
            placeholder={t("placeholders.tradeName")}
            defaultValue={draft.fields.tradeName ?? ""}
            name="tradeName"
            maxLength={120}
            required
            className="w-full"
          />
        </label>
        <label className="flex flex-col gap-1">
          {t("corporateName")}
          <Textarea
            rows={3}
            aria-label={t("corporateName")}
            placeholder={t("placeholders.corporateName")}
            defaultValue={draft.fields.corporateName ?? ""}
            name="corporateName"
            maxLength={120}
            required
            className="w-full"
          />
        </label>

        <FormSection title={t("addressSection")} collapsible defaultExpanded={false}>
          <div className="flex w-full flex-col gap-4">
            <label className="flex flex-col gap-1">
              {t("zipCode")}
              <CepInput
                aria-label={t("zipCode")}
                placeholder={t("placeholders.zipCode")}
                value={address.zipCode}
                onValueChange={(zipCode) => {
                  void changeZipCode(zipCode);
                }}
                name="zipCode"
                required
                className="w-full"
              />
            </label>
            {postalStatus && (
              <p role="status" aria-live="polite" className="text-body text-operational-muted">
                {t(`postal.${postalStatus}`)}
              </p>
            )}
            <label className="flex flex-col gap-1">
              {t("state")}
              <UfInput
                label={t("state")}
                placeholder={t("placeholders.state")}
                name="state"
                value={address.state}
                emptyLabel={t("stateNotFound")}
                required
                onChange={(state) => updateAddress({ ...addressRef.current, state })}
              />
            </label>
            <label className="flex flex-col gap-1">
              {t("city")}
              <Input
                aria-label={t("city")}
                placeholder={t("placeholders.city")}
                value={address.city}
                onChange={(event) => updateAddress({ ...addressRef.current, city: event.target.value })}
                name="city"
                required
                className="w-full"
              />
            </label>
            <label className="flex flex-col gap-1">
              {t("neighborhood")}
              <Input
                aria-label={t("neighborhood")}
                placeholder={t("placeholders.neighborhood")}
                value={address.neighborhood}
                onChange={(event) => updateAddress({ ...addressRef.current, neighborhood: event.target.value })}
                name="neighborhood"
                className="w-full"
              />
            </label>
            <label className="col-span-2 flex flex-col gap-1">
              {t("street")}
              <Input
                aria-label={t("street")}
                placeholder={t("placeholders.street")}
                value={address.street}
                onChange={(event) => updateAddress({ ...addressRef.current, street: event.target.value })}
                name="street"
                required
                className="w-full"
              />
            </label>
            <label className="flex flex-col gap-1">
              {t("number")}
              <Input
                aria-label={t("number")}
                placeholder={t("placeholders.number")}
                defaultValue={draft.fields.number ?? ""}
                name="number"
                maxLength={10}
                className="w-full"
              />
            </label>
          </div>
        </FormSection>
        <FormSection title={t("contactSection")} collapsible defaultExpanded={false}>
          <label className="flex flex-col gap-1">
            {t("companyEmail")}
            <Input
              aria-label={t("companyEmail")}
              placeholder={t("placeholders.companyEmail")}
              defaultValue={draft.fields.companyEmail ?? ""}
              name="companyEmail"
              type="email"
              required
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
              placeholder={t("placeholders.phone")}
              className="w-full"
            />
          </label>
          <label className="flex flex-col gap-1">
            {t("website")}
            <Input
              aria-label={t("website")}
              defaultValue={draft.fields.website ?? ""}
              name="website"
              type="url"
              placeholder={t("placeholders.website")}
              className="w-full"
            />
          </label>
        </FormSection>
        {error ? (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        ) : null}
        <PrimaryButton type="submit" disabled={saving} className="w-full min-h-12" content={t("submit")} description={t("submit")} />
      </OperationalForm>
    </OperationalPage>
  );
}
