import { PrimaryButton } from "@@/ui/button/Button.presets";
import Input from "@@/ui/input/Input";
import OperationalForm from "@@/layout/operational-page/OperationalForm";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { redeemAccessCode } from "@/features/companies/company.management.service";
import { selectContext } from "@/features/access/access.onboarding.service";

export default function CompanyAccessPage() {
  const { t } = useTranslation("commons", { keyPrefix: "accessInfo" });
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(false);
    try {
      const membership = await redeemAccessCode(code.trim().toUpperCase());
      selectContext(membership.companyId);
      navigate(routePaths.ownCompanyProfile(lang), { replace: true });
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <OperationalPage title={t("title")} description={t("description")} compact form centered formBackground>
      <OperationalForm plain onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1">
          {t("code")}
          <Input
            name="code"
            aria-label={t("code")}
            placeholder={t("code")}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            maxLength={8}
            required
            className="w-full"
          />
        </label>
        {error ? (
          <p role="alert" className="text-feedback-error">
            {t("error")}
          </p>
        ) : null}
        <PrimaryButton type="submit" disabled={saving || !code.trim()} className="min-h-12 w-full" content={t("submit")} description={t("submit")} />
      </OperationalForm>
    </OperationalPage>
  );
}
