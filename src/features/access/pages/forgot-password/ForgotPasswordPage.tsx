import { type FormEvent, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@/components/layout/access/Access";
import Hyperlink from "@/components/ui/link/Hyperlink";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { requestPasswordReset } from "@/config/firebase/auth/auth.service";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";

export default function ForgotPasswordPage() {
  const { t } = useTranslation("access");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    setError(null);
    try {
      if (isAlwaysMockMode()) await waitForMockService();
      else await requestPasswordReset(String(data.get("email") ?? ""));
      setSent(true);
    } catch {
      setError(t("forgotPassword.error"));
    }
  }

  const backToLogin = (
    <div className="flex flex-wrap items-center gap-1">
      <span>{t("forgotPassword.rememberedPasswordPrefix")}</span>
      <Hyperlink content={t("forgotPassword.backToLogin")} url={routePaths.login(lang)} className="text-hyperlink" />
    </div>
  );

  if (sent) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center gap-4 p-6 text-center">
        <p role="status">{t("forgotPassword.sent")}</p>
        {backToLogin}
      </main>
    );
  }

  return (
    <Access
      heading="Solaria"
      helperText={t("forgotPassword.helperText")}
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
      footer={backToLogin}
    />
  );
}
