import { useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@/components/layout/access/Access";
import Hyperlink from "@/components/ui/link/Hyperlink";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { loginWithMockProvider, requestPasswordReset } from "@/features/access/access.service";
import type { LoginProvider } from "@/config/firebase/auth/layout/LoginWithProvider";

export default function ForgotPasswordPage() {
  const { t } = useTranslation("access");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSuccess(false);

    try {
      await requestPasswordReset();
      setSuccess(true);
    } catch {
      setError(t("forgotPassword.error"));
    }
  }

  async function handleMockProviderLogin(provider: LoginProvider) {
    await loginWithMockProvider(provider);
    navigate(routePaths.home(lang));
  }

  return (
    <Access
      heading="Solaria"
      helperText={success ? t("forgotPassword.success") : t("forgotPassword.helperText")}
      fields={[
        {
          name: "email",
          type: "email",
          placeholder: t("fields.email.placeholder"),
        },
      ]}
      submitLabel={t("forgotPassword.submit")}
      error={error}
      onSubmit={handleSubmit}
      onMockProviderLogin={handleMockProviderLogin}
      footer={
        <div className="flex flex-wrap items-center gap-1">
          <span>{t("forgotPassword.rememberedPasswordPrefix")}</span>
          <Hyperlink content={t("forgotPassword.backToLogin")} url={routePaths.login(lang)} className="text-hyperlink" />
        </div>
      }
    />
  );
}
