import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";

export default function AccessInfoPage() {
  const { t } = useTranslation("commons", { keyPrefix: "accessInfo" });
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-gray-600">{t("description")}</p>
      <Link to={routePaths.accountSetup(lang)} className="text-orange">{t("back")}</Link>
    </main>
  );
}
