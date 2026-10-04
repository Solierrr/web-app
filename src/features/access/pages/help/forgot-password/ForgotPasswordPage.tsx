import { type FormEvent, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@/lib/components/layout/access/Access";
import Hyperlink from "@/lib/components/ui/link/Hyperlink";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { requestPasswordReset } from "@/config/firebase/auth/auth.service";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";

export default function ForgotPasswordPage() {
  const { t } = useTranslation("access");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (busy) return;
    const data = new FormData(event.currentTarget);
    setError(null);
    setBusy(true);
    try {
      if (isAlwaysMockMode()) await waitForMockService();
      else await requestPasswordReset(String(data.get("email") ?? ""));
      setSent(true);
    } catch {
      setError(t("forgotPassword.error"));
    } finally {
      setBusy(false);
    }
  }

  const backToLogin = (
    <div className="flex flex-wrap items-center gap-1">
      <span>{t("forgotPassword.rememberedPasswordPrefix")}</span>
      <Hyperlink content={t("forgotPassword.backToLogin")} url={routePaths.login(lang)} />
    </div>
  );

  if (sent) {
    return (
      <Access heading="Solaria" animatedBackground={false} footer={backToLogin}>
        <p role="status">{t("forgotPassword.sent")}</p>
      </Access>
    );
  }

  return (
    <Access
      heading="Solaria"
      animatedBackground={false}
      busy={busy}
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
