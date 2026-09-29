import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { redeemAccessCode } from "@/features/companies/companyManagement.service";

export default function AccessInfoPage() {
  const { t } = useTranslation("commons", { keyPrefix: "accessInfo" });
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(false);
    try {
      await redeemAccessCode(code.trim().toUpperCase());
      navigate(routePaths.ownCompanyProfile(lang), { replace: true });
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-gray-600">{t("description")}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">{t("code")}
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            maxLength={8}
            required
            className="rounded-lg border border-gray-300 p-2 font-mono uppercase"
          />
        </label>
        {error ? <p role="alert" className="text-red-700">{t("error")}</p> : null}
        <button type="submit" disabled={saving || !code.trim()} className="rounded-lg bg-orange px-5 py-2 text-white disabled:opacity-50">
          {t("submit")}
        </button>
      </form>
    </main>
  );
}
