import { type FormEvent, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@/components/layout/access/Access";
import Hyperlink from "@/components/ui/link/Hyperlink";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { login, loginWithFirebase } from "@/features/access/access.service";
import { login as loginFirebase } from "@/config/firebase/auth/auth.service";

export default function LoginPage() {
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

    try {
      await login({ email, password });
    } catch {
      // A senha local pode ter divergido da senha do Firebase depois de um reset via
      // sendPasswordResetEmail — quem já vinculou a conta consegue entrar assim mesmo.
      try {
        const { user } = await loginFirebase(email, password);
        const idToken = await user.getIdToken();
        await loginWithFirebase(idToken);
      } catch {
        setError(t("login.error"));
        return;
      }
    }

    const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
    navigate(returnTo?.startsWith(`/${lang}/`) ? returnTo : routePaths.home(lang), { replace: true });
  }

  return (
    <Access
      heading="Solaria"
      helperText={
        <div className="flex flex-wrap items-center gap-1">
          <span>{t("login.helperTextPrefix")}</span>
          <Hyperlink content={t("login.contactSupport")} url={routePaths.home(lang)} className="text-hyperlink" />
        </div>
      }
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
        },
      ]}
      submitLabel={t("login.submit")}
      error={error}
      onSubmit={handleSubmit}
      footer={
        <div className="flex flex-col gap-2">
          <Hyperlink content={t("login.forgotPassword")} url={routePaths.forgotPassword(lang)} className="text-hyperlink" />
          <div className="flex flex-wrap items-center gap-1">
            <span>{t("login.noAccountPrefix")}</span>
            <Hyperlink content={t("login.register")} url={routePaths.register(lang)} state={location.state} className="text-hyperlink" />
          </div>
        </div>
      }
    />
  );
}
