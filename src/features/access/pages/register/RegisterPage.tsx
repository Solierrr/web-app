import { type FormEvent, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@/components/layout/access/Access";
import Hyperlink from "@/components/ui/link/Hyperlink";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { login, register } from "@/features/access/access.service";
import { register as registerFirebase, sendVerificationEmail } from "@/config/firebase/auth/auth.service";
import logger from "@/config/logging/logger";

export default function RegisterPage() {
  const { t } = useTranslation("access");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    setError(null);

    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    if (password !== String(data.get("confirmPassword") ?? "")) {
      setError(t("register.passwordMismatch"));
      return;
    }

    try {
      await register({ email, password });
      await login({ email, password });
      try {
        const { user } = await registerFirebase(email, password);
        await sendVerificationEmail(user);
      } catch (firebaseError) {
        // Não bloqueia o cadastro local; a verificação de e-mail pode ser retomada depois em VerifyEmailPage.
        logger.error("Falha ao criar/verificar conta Firebase no cadastro", firebaseError);
      }
      const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
      navigate(returnTo?.startsWith(`/${lang}/`) ? returnTo : routePaths.ownUserProfile(lang), { replace: true });
    } catch {
      setError(t("register.error"));
    }
  }

  return (
    <Access
      heading="Solaria"
      helperText={t("register.helperText")}
      fields={[
        {
          name: "email",
          type: "email",
          placeholder: t("fields.email.placeholder"),
        },
        {
          name: "password",
          placeholder: t("fields.password.placeholder"),
          password: true,
          minLength: 12,
        },
        {
          name: "confirmPassword",
          placeholder: t("fields.confirmPassword.placeholder"),
          password: true,
          minLength: 12,
        },
      ]}
      submitLabel={t("register.submit")}
      error={error}
      onSubmit={handleSubmit}
      footer={
        <div className="flex flex-wrap items-center gap-1">
          <span>{t("register.hasAccountPrefix")}</span>
          <Hyperlink content={t("register.login")} url={routePaths.login(lang)} state={location.state} className="text-hyperlink" />
        </div>
      }
    />
  );
}
