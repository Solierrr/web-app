import { type FormEvent, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@/lib/components/layout/access/Access";
import Hyperlink from "@/lib/components/ui/link/Hyperlink";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { login, register } from "@/features/access/access.service";
import { register as registerFirebase, sendVerificationEmail } from "@/config/firebase/auth/auth.service";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";

export default function RegisterPage() {
  const { t } = useTranslation("access");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (busy) return;
    const data = new FormData(event.currentTarget);
    setError(null);

    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    if (password !== String(data.get("confirmPassword") ?? "")) {
      setError(t("register.passwordMismatch"));
      return;
    }

    setBusy(true);
    try {
      await register({ email, password });
      await login({ email, password });
      if (!isAlwaysMockMode()) {
        try {
          const { user } = await registerFirebase(email, password);
          await sendVerificationEmail(user);
        } catch {
          navigate(routePaths.verifyEmail(lang), { replace: true, state: location.state });
          return;
        }
      }
      navigate(routePaths.verifyEmail(lang), { replace: true, state: location.state });
    } catch {
      setError(t("register.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Access
      heading={t("register.title")}
      compact
      animatedBackground={false}
      formHeader={<p className="text-center text-sm text-operational-muted">{t("register.helperText")}</p>}
      fields={[
        {
          name: "email",
          type: "email",
          label: t("login.emailLabel"),
          placeholder: t("register.emailPlaceholder"),
          autoComplete: "email",
        },
        {
          name: "password",
          label: t("login.passwordLabel"),
          placeholder: t("register.passwordPlaceholder"),
          autoComplete: "new-password",
          password: true,
          minLength: 12,
        },
        {
          name: "confirmPassword",
          label: t("register.confirmPasswordLabel"),
          placeholder: t("register.confirmPasswordPlaceholder"),
          autoComplete: "new-password",
          password: true,
          minLength: 12,
        },
      ]}
      submitLabel={t("register.submit")}
      busy={busy}
      error={error}
      onSubmit={handleSubmit}
      footer={
        <div className="flex w-full flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-1 text-sm">
            <span className="text-operational-muted">{t("register.hasAccountPrefix")}</span>
            <Hyperlink content={t("register.login")} url={routePaths.login(lang)} state={location.state} className="text-orange" />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-xs text-operational-muted">{t("login.policiesIntro")}</p>
            <div className="flex flex-wrap justify-center gap-1">
              <Hyperlink content={t("login.terms")} url={routePaths.termsPolicy(lang)} className="text-xs underline underline-offset-4" />
              <Hyperlink content={t("login.privacy")} url={routePaths.privacyPolicy(lang)} className="text-xs underline underline-offset-4" />
              <Hyperlink content={t("login.cookies")} url={routePaths.cookiePolicy(lang)} className="text-xs underline underline-offset-4" />
            </div>
          </div>
        </div>
      }
    />
  );
}
