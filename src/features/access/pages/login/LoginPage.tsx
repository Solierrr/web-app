import { type FormEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@/components/layout/access/Access";
import Hyperlink from "@/components/ui/link/Hyperlink";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { login } from "@/features/access/access.service";

export default function LoginPage() {
  const { t } = useTranslation("access");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    setError(null);

    try {
      await login({
        email: String(data.get("email") ?? ""),
        password: String(data.get("password") ?? ""),
      });
      navigate(routePaths.home(lang));
    } catch {
      setError(t("login.error"));
    }
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
            <Hyperlink content={t("login.register")} url={routePaths.register(lang)} className="text-hyperlink" />
          </div>
        </div>
      }
    />
  );
}
