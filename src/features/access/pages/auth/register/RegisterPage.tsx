import { type FormEvent, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@/lib/components/layout/access/Access";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import LanguageSwitcher from "@@/layout/navbar/LanguageSwitcher";
import { LoginShortcuts } from "../login/LoginPage.reusable";
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
      helperText={t("register.helperText")}
      topAction={<LanguageSwitcher />}
      backAction={<ToolbarAction icon="chevronLeft" label={t("register.login")} to={routePaths.login(lang)} state={location.state} />}
      logoInteractive
      compact
      notice={createdEmail ? t("register.accountCreated") : undefined}
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
      footer={<LoginShortcuts lang={lang} state={location.state} policiesOnly />}
    />
  );
}
