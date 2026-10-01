import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";

export default function SettingsPage() {
  const { t } = useTranslation("commons", { keyPrefix: "settings" });
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;

  return (
    <OperationalPage title={t("title")} compact>
      <nav className="flex flex-col divide-y divide-operational-border rounded-small border border-operational-border">
        <Link to={routePaths.ownUserProfile(lang)} className="block p-4 hover:bg-operational-hover">
          {t("profile")}
        </Link>
        <Link to={routePaths.settingsSecurity(lang)} className="block p-4 hover:bg-operational-hover">
          {t("security")}
        </Link>
      </nav>
    </OperationalPage>
  );
}
