import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@@/layout/access/Access";
import Hyperlink from "@@/ui/link/Hyperlink";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { useAuth } from "@/features/access/auth/Auth.utils";

export default function LoginPage() {
  const { t } = useTranslation("access");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const email = new FormData(event.currentTarget).get("email");

    // TODO: substituir por chamada real ao access.service quando o login estiver conectado à API.
    login({ id: "mock-access", name: "Você", email: typeof email === "string" ? email : "" });
    navigate(routePaths.home(lang));
  }

  return (
    <Access
      onSubmit={handleSubmit}
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
