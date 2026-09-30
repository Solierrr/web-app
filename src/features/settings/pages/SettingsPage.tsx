import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";

export default function SettingsPage() {
  const { t } = useTranslation("commons", { keyPrefix: "settings" });
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <nav className="flex flex-col divide-y divide-gray-200 rounded-xl border border-gray-200">
        <Link to={routePaths.ownUserProfile(lang)} className="block p-4 hover:bg-gray-50">{t("profile")}</Link>
        <Link to={routePaths.settingsSecurity(lang)} className="block p-4 hover:bg-gray-50">{t("security")}</Link>
      </nav>
    </main>
  );
}
