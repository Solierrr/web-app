import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@@/layout/access/Access";
import Hyperlink from "@@/ui/link/Hyperlink";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";

export default function ForgotPasswordPage() {
  const { t } = useTranslation("access");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;

  return (
    <Access
      heading="Solaria"
      helperText={t("forgotPassword.helperText")}
      fields={[
        {
          name: "email",
          type: "email",
          placeholder: t("fields.email.placeholder"),
        },
      ]}
      submitLabel={t("forgotPassword.submit")}
      footer={
        <div className="flex flex-wrap items-center gap-1">
          <span>{t("forgotPassword.rememberedPasswordPrefix")}</span>
          <Hyperlink content={t("forgotPassword.backToLogin")} url={routePaths.login(lang)} className="text-hyperlink" />
        </div>
      }
    />
  );
}
