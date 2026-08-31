import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@/components/layout/access/Access";
import { Hyperlink } from "@/components/ui/link/Hyperlink";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/routePaths";

export default function LoginPage() {
  const { t } = useTranslation("access");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;

  return (
    <Access
      heading="Solaria"
      helperText={
        <div className="flex flex-wrap items-center gap-1">
          <span>{t("login.helperTextPrefix")}</span>
          <Hyperlink
            content={t("login.contactSupport")}
            url={routePaths.home(lang)}
            className="text-hyperlink"
          />
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
          <Hyperlink
            content={t("login.forgotPassword")}
            url={routePaths.forgotPassword(lang)}
            className="text-hyperlink"
          />
          <div className="flex flex-wrap items-center gap-1">
            <span>{t("login.noAccountPrefix")}</span>
            <Hyperlink
              content={t("login.register")}
              url={routePaths.register(lang)}
              className="text-hyperlink"
            />
          </div>
        </div>
      }
    />
  );
}
