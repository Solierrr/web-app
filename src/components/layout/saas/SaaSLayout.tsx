import { Outlet, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "@@/layout/sidebar/Sidebar";
import { SidebarOption } from "@@/layout/sidebar/Sidebar.reusables";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";

export function SaaSLayout() {
  const { t } = useTranslation("commons", { keyPrefix: "saasSidebar" });
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;

  return (
    <div className="flex min-h-screen">
      <Sidebar>
        <SidebarOption to={routePaths.ownUserProfile(lang)} icon="user" content={t("userProfile")} />
        <SidebarOption to={routePaths.ownCompanyProfile(lang)} icon="building" content={t("companyProfile")} />
        <SidebarOption to={routePaths.solarPanelModelsCrud(lang)} icon="settings" content={t("solarPanelModels")} />
      </Sidebar>

      <div className="w-full">
        <Outlet />
      </div>
    </div>
  );
}
