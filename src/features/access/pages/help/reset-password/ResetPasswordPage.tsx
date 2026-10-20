import { type FormEvent, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@/lib/components/layout/access/Access";
import Hyperlink from "@/lib/components/ui/link/Hyperlink";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { completePasswordReset } from "@/features/access/access.credentials.service";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import { getAccessErrorMessage } from "@/features/access/access.utils";
import Alert from "@@/feedback/alert/Alert";

export default function ResetPasswordPage() {
  const { t } = useTranslation("access");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const code = useSearchParams()[0].get("token");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mock = isAlwaysMockMode("AUTH");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (busy) return;
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    if (password !== String(data.get("confirmPassword") ?? "")) {
      setError(t("resetPassword.mismatch"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (mock) await waitForMockService();
      else await completePasswordReset(code ?? "", password);
      setDone(true);
    } catch (failure) {
      setError(getAccessErrorMessage(failure, t("resetPassword.error")));
    } finally {
      setBusy(false);
    }
  }

  if (done || (!code && !mock)) {
    return (
      <Access heading={t("resetPassword.title")} animatedBackground={false}>
        <Alert state={done ? "success" : "error"}>{done ? t("resetPassword.success") : t("resetPassword.invalidLink")}</Alert>
        <Hyperlink
          content={done ? t("forgotPassword.backToLogin") : t("resetPassword.requestNewLink")}
          url={done ? routePaths.login(lang) : routePaths.forgotPassword(lang)}
        />
      </Access>
    );
  }

  return (
    <Access
      heading={t("resetPassword.title")}
      animatedBackground={false}
      helperText={t("resetPassword.helperText")}
      fields={[
        {
          name: "password",
          label: t("login.passwordLabel"),
          placeholder: t("fields.password.placeholder"),
          password: true,
          minLength: 12,
          autoComplete: "new-password",
        },
        {
          name: "confirmPassword",
          label: t("register.confirmPasswordLabel"),
          placeholder: t("fields.confirmPassword.placeholder"),
          password: true,
          minLength: 12,
          autoComplete: "new-password",
        },
      ]}
      submitLabel={t("resetPassword.submit")}
      busy={busy}
      error={error}
      onSubmit={handleSubmit}
      footer={error ? <Hyperlink content={t("resetPassword.requestNewLink")} url={routePaths.forgotPassword(lang)} /> : undefined}
    />
  );
}
