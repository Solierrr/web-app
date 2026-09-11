import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@/components/layout/access/Access";
import Hyperlink from "@/components/ui/link/Hyperlink";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";

export default function RegisterPage() {
  const { t } = useTranslation("access");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;

  return (
    <Access
      heading="Solaria"
      helperText={t("register.helperText")}
      fields={[
        { name: "name", placeholder: t("fields.name.placeholder") },
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
        {
          name: "confirmPassword",
          placeholder: t("fields.confirmPassword.placeholder"),
          password: true,
        },
      ]}
      submitLabel={t("register.submit")}
      footer={
        <div className="flex flex-wrap items-center gap-1">
          <span>{t("register.hasAccountPrefix")}</span>
          <Hyperlink content={t("register.login")} url={routePaths.login(lang)} className="text-hyperlink" />
        </div>
      }
    />
  );
}
