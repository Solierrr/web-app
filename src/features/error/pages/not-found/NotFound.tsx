import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ErrorPage from "../generic/Generic";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";

export function NotFoundPage() {
  const navigate = useNavigate();
  const { lang: parameter } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const { t } = useTranslation("commons", { keyPrefix: "notFound" });

  return (
    <ErrorPage
      title={t("title")}
      message={t("subtitle")}
      actionLabel={t("back")}
      onReturn={() => navigate(routePaths.home(lang), { replace: true })}
    />
  );
}
