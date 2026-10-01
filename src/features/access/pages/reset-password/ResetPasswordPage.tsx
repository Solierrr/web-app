import { type FormEvent, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@/lib/components/layout/access/Access";
import Hyperlink from "@/lib/components/ui/link/Hyperlink";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { completePasswordReset } from "@/config/firebase/auth/auth.service";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";

export default function ResetPasswordPage() {
  const { t } = useTranslation("access");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const code = useSearchParams()[0].get("oobCode");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mock = isAlwaysMockMode();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
    } catch {
      setError(t("resetPassword.error"));
    } finally {
      setBusy(false);
    }
  }

  if (done || (!code && !mock)) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center gap-4 p-6 text-center">
        <p role={done ? "status" : "alert"}>{done ? t("resetPassword.success") : t("resetPassword.invalidLink")}</p>
        <Hyperlink
          content={done ? t("forgotPassword.backToLogin") : t("resetPassword.requestNewLink")}
          url={done ? routePaths.login(lang) : routePaths.forgotPassword(lang)}
          className="text-hyperlink"
        />
      </main>
    );
  }

  return (
    <Access
      heading="Solaria"
      helperText={t("resetPassword.helperText")}
      fields={[
        { name: "password", placeholder: t("fields.password.placeholder"), password: true, minLength: 12 },
        { name: "confirmPassword", placeholder: t("fields.confirmPassword.placeholder"), password: true, minLength: 12 },
      ]}
      submitLabel={t("resetPassword.submit")}
      busy={busy}
      error={error}
      onSubmit={handleSubmit}
    />
  );
}
