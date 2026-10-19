import { type FormEvent, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@/lib/components/layout/access/Access";
import Hyperlink from "@/lib/components/ui/link/Hyperlink";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { login, register } from "@/features/access/access.service";
import { requestEmailVerification } from "@/features/access/access.credentials.service";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import { getAccessErrorMessage } from "@/features/access/access.utils";

export default function RegisterPage() {
  const { t } = useTranslation("access");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);

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
      if (createdEmail !== email) {
        await register({ email, password });
        setCreatedEmail(email);
      }
      await login({ email, password });
      if (!isAlwaysMockMode("AUTH")) {
        try {
          await requestEmailVerification();
        } catch (failure) {
          navigate(routePaths.verifyEmail(lang), {
            replace: true,
            state: { ...location.state, verificationError: getAccessErrorMessage(failure, t("feedback.emailUnavailable")) },
          });
          return;
        }
      }
      navigate(routePaths.verifyEmail(lang), { replace: true, state: location.state });
    } catch (failure) {
      setError(getAccessErrorMessage(failure, t("register.error")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Access
      heading={t("register.title")}
      compact
      animatedBackground={false}
      notice={createdEmail ? t("register.accountCreated") : undefined}
      formHeader={<p className="text-center text-body text-operational-muted">{t("register.helperText")}</p>}
      fields={[
        {
          name: "email",
          type: "email",
          label: t("login.emailLabel"),
          placeholder: t("register.emailPlaceholder"),
          autoComplete: "email",
          readOnly: Boolean(createdEmail),
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
      submitLabel={t(createdEmail ? "login.signIn" : "register.submit")}
      busy={busy}
      error={error}
      onSubmit={handleSubmit}
      footer={
        <div className="flex w-full flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-1 text-body">
            <span className="text-operational-muted">{t("register.hasAccountPrefix")}</span>
            <Hyperlink content={t("register.login")} url={routePaths.login(lang)} state={location.state} className="text-orange" />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-body text-operational-muted">{t("login.policiesIntro")}</p>
            <div className="flex flex-wrap justify-center gap-1">
              <Hyperlink content={t("login.terms")} url={routePaths.termsPolicy(lang)} className="text-body underline underline-offset-4" />
              <Hyperlink content={t("login.privacy")} url={routePaths.privacyPolicy(lang)} className="text-body underline underline-offset-4" />
              <Hyperlink content={t("login.cookies")} url={routePaths.cookiePolicy(lang)} className="text-body underline underline-offset-4" />
            </div>
          </div>
        </div>
      }
    />
  );
}
