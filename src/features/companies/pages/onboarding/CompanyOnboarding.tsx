import { useState, type FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { createCompany } from "@/features/companies/company.service";
import { getMyUser } from "@/features/users/user/user.service";

export default function CompanyOnboarding() {
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const navigate = useNavigate();
  const location = useLocation();
  const suggestedType = (location.state as { suggestedType?: string } | null)?.suggestedType;
  const { t } = useTranslation("commons", { keyPrefix: "companyOnboarding" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setError(false);
    try {
      await getMyUser();
      await createCompany({
        type: String(data.get("type")) as "SUPPLIER" | "DEMANDANT",
        cnpj: String(data.get("cnpj")).replace(/\D/g, ""),
        tradeName: String(data.get("tradeName")).trim(),
        corporateName: String(data.get("corporateName")).trim(),
      });
      const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
      navigate(returnTo?.startsWith(`/${lang}/`) ? returnTo : routePaths.ownCompanyProfile(lang), { replace: true });
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
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
        {error ? <p role="alert" className="text-red-700">{t("error")}</p> : null}
        <button type="submit" disabled={saving} className="rounded-lg bg-orange px-5 py-2 text-white disabled:opacity-50">
          {t("submit")}
        </button>
      </form>
    </main>
  );
}
