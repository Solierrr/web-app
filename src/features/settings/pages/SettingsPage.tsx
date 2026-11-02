import OperationalPage from "@@/layout/operational-page/OperationalPage";
import GroupAction from "@@/ui/button/GroupAction";
import SurfaceGroup from "@@/ui/surface/SurfaceGroup";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import PushToggle from "@/features/notifications/components/PushToggle";
import AccountLanguage from "../components/AccountLanguage";

export default function SettingsPage() {
  const { t } = useTranslation("commons", { keyPrefix: "settings" });
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;

  return (
    <OperationalPage title={t("title")} description={t("description")} compact centered sideBackground>
      <SurfaceGroup role="navigation" aria-label={t("title")}>
        <GroupAction to={routePaths.ownUserProfile(lang)} icon="user" label={t("profile")} content={t("profile")} />
        <GroupAction to={routePaths.settingsSecurity(lang)} icon="shieldCheck" label={t("security")} content={t("security")} />
        <GroupAction to={routePaths.settingsPrivacy(lang)} icon="eye" label={t("privacy")} content={t("privacy")} />
        <GroupAction to={routePaths.settingsSessions(lang)} icon="history" label={t("sessions")} content={t("sessions")} />
      </SurfaceGroup>
      <AccountLanguage />
      <PushToggle />
    </OperationalPage>
  );
}
