import { type FormEvent, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@/lib/components/layout/access/Access";
import Hyperlink from "@/lib/components/ui/link/Hyperlink";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { requestPasswordReset } from "@/features/access/access.credentials.service";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import { getAccessErrorMessage } from "@/features/access/access.utils";
import Alert from "@@/feedback/alert/Alert";

export default function ForgotPasswordPage() {
  const { t } = useTranslation("access");
  const location = useLocation();
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
      if (isAlwaysMockMode("AUTH")) await waitForMockService();
      else await requestPasswordReset(String(data.get("email") ?? ""));
      setSent(true);
    } catch (failure) {
      setError(getAccessErrorMessage(failure, t("forgotPassword.error")));
    } finally {
      setBusy(false);
    }
  }

  const backToLogin = (
    <div className="flex flex-wrap items-center justify-center gap-1 text-center">
      <span>{t("forgotPassword.rememberedPasswordPrefix")}</span>
      <Hyperlink content={t("forgotPassword.backToLogin")} url={routePaths.login(lang)} state={location.state} />
    </div>
  );

  if (sent) {
    return (
      <Access heading={t("forgotPassword.title")} animatedBackground={false} footer={backToLogin}>
        <Alert state="success">{t("forgotPassword.sent")}</Alert>
      </Access>
    );
  }

  return (
    <Access
      heading={t("forgotPassword.title")}
      animatedBackground={false}
      busy={busy}
      helperText={t("forgotPassword.helperText")}
      fields={[
        {
          name: "email",
          type: "email",
          label: t("login.emailLabel"),
          autoComplete: "email",
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
