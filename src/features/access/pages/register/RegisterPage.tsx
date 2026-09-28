import { type FormEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@/components/layout/access/Access";
import Hyperlink from "@/components/ui/link/Hyperlink";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { login, loginWithMockProvider, register } from "@/features/access/access.service";
import type { LoginProvider } from "@/config/firebase/auth/layout/LoginWithProvider";
import DefaultSelect from "@@/ui/select/Select";
import type { CompanyType } from "@/features/saas/saas";
import { createCompany } from "@/features/companies/company.service";
import { setMockProfessionalContext } from "@/features/saas/saas.service";
import { getMocksMode } from "@/config/mocks/mockMode.utils";
import MocksMode from "@/config/mocks/mocksMode.enum";

type RegistrationKind = "company" | "professional";

export default function RegisterPage() {
  const { t } = useTranslation("access");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [registrationKind, setRegistrationKind] = useState<RegistrationKind | undefined>();
  const [companyType, setCompanyType] = useState<CompanyType | undefined>();
  const [accountCreated, setAccountCreated] = useState(false);
  const mocksEnabled = getMocksMode() !== MocksMode.DEACTIVATED;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    setError(null);

    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    const companyInput = {
      type: companyType ?? (mocksEnabled ? "SUPPLIER" : undefined),
      cnpj: String(data.get("cnpj") ?? "").replace(/\D/g, ""),
      tradeName: String(data.get("tradeName") ?? "").trim(),
      corporateName: String(data.get("corporateName") ?? "").trim(),
    };

    const selectedRegistrationKind = registrationKind ?? (mocksEnabled ? "professional" : undefined);
    const selectedCompanyType = companyType ?? (mocksEnabled && selectedRegistrationKind === "company" ? "SUPPLIER" : undefined);

    if (!selectedRegistrationKind || (selectedRegistrationKind === "company" && !selectedCompanyType)) {
      setError(t("register.accountTypeRequired"));
      return;
    }

    if (!mocksEnabled && password !== String(data.get("confirmPassword") ?? "")) {
      setError(t("register.passwordMismatch"));
      return;
    }

    try {
      if (!accountCreated) {
        await register({ email, password });
        await login({ email, password });
        setAccountCreated(true);
      }

      if (selectedRegistrationKind === "company") {
        await createCompany({ ...companyInput, type: selectedCompanyType! });
        navigate(selectedCompanyType === "SUPPLIER" ? routePaths.supplierDashboard(lang) : routePaths.demandantDashboard(lang));
        return;
      }

      setMockProfessionalContext();
      navigate(routePaths.ownUserProfile(lang));
    } catch {
      setError(t("register.error"));
    }
  }

  async function handleMockProviderLogin(provider: LoginProvider) {
    await loginWithMockProvider(provider);
    navigate(routePaths.home(lang));
  }

  return (
    <Access
      heading="Solaria"
      helperText={t("register.helperText")}
      formHeaderContent={
        <>
          <DefaultSelect
            name={t("register.accountType")}
            options={[
              [t("register.company"), "company"],
              [t("register.professional"), "professional"],
            ]}
            value={registrationKind}
            placeholder={t("register.accountType")}
            onChange={(value) => setRegistrationKind(value as RegistrationKind | undefined)}
            className="w-full"
          />
          {registrationKind === "company" && (
            <DefaultSelect
              name={t("register.companyType")}
              options={[
                [t("register.supplier"), "SUPPLIER"],
                [t("register.demandant"), "DEMANDANT"],
              ]}
              value={companyType}
              placeholder={t("register.companyType")}
              onChange={(value) => setCompanyType(value as CompanyType | undefined)}
              className="w-full"
            />
          )}
        </>
      }
      fields={[
        { name: "name", placeholder: t("fields.name.placeholder") },
        {
          name: "email",
          type: "email",
          placeholder: t("fields.email.placeholder"),
        },
        {
          name: "password",
          placeholder: t("fields.password.placeholder"),
          password: true,
        },
        {
          name: "confirmPassword",
          placeholder: t("fields.confirmPassword.placeholder"),
          password: true,
        },
        ...(registrationKind === "company"
          ? [
              { name: "cnpj", placeholder: t("register.cnpj"), type: "text" },
              { name: "tradeName", placeholder: t("register.tradeName"), type: "text" },
              { name: "corporateName", placeholder: t("register.corporateName"), type: "text" },
            ]
          : []),
      ]}
      submitLabel={t("register.submit")}
      error={error}
      onSubmit={handleSubmit}
      onMockProviderLogin={handleMockProviderLogin}
      footer={
        <div className="flex flex-wrap items-center gap-1">
          <span>{t("register.hasAccountPrefix")}</span>
          <Hyperlink content={t("register.login")} url={routePaths.login(lang)} className="text-hyperlink" />
        </div>
      }
    />
  );
}
