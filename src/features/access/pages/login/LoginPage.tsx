import { type FormEvent, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@/components/layout/access/Access";
import Hyperlink from "@/components/ui/link/Hyperlink";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { login, loginWithFirebase } from "@/features/access/access.service";
import { login as loginFirebase, loginWithGoogle } from "@/config/firebase/auth/auth.service";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";

export default function LoginPage() {
  const { t } = useTranslation("access");
  const { t: tAccess } = useTranslation("onboarding");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  async function handleGoogle() {
    try {
      if (isAlwaysMockMode()) await login({ email: "google@example.com", password: "" });
      else {
        const user = await loginWithGoogle();
        await loginWithFirebase(await user.getIdToken());
      }
      const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
      navigate(returnTo?.startsWith(`/${lang}/`) ? returnTo : routePaths.dashboard(lang), { replace: true });
    } catch {
      setError(t("login.error"));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    setError(null);

    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    try {
      await login({ email, password });
      if (!isAlwaysMockMode()) await loginFirebase(email, password).catch(() => undefined);
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
    navigate(returnTo?.startsWith(`/${lang}/`) ? returnTo : routePaths.dashboard(lang), { replace: true });
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
          <button type="button" onClick={() => void handleGoogle()} className="rounded-lg border border-gray-300 p-3">
            {tAccess("google")}
          </button>
          <Hyperlink content={t("login.forgotPassword")} url={routePaths.forgotPassword(lang)} className="text-hyperlink" />
          <div className="flex flex-wrap items-center gap-1">
            <span>{t("login.noAccountPrefix")}</span>
            <Hyperlink content={tAccess("haveCode")} url={routePaths.activateAccess(lang)} className="text-hyperlink" />
          </div>
          <Hyperlink content={tAccess("professional")} url={routePaths.registerProfessional(lang)} className="text-hyperlink" />
          <Hyperlink content={tAccess("company")} url={routePaths.registerCompany(lang)} className="text-hyperlink" />
        </div>
      }
    />
  );
}
