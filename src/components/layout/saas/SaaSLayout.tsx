import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "@@/layout/sidebar/Sidebar";
import { SidebarOption } from "@@/layout/sidebar/Sidebar.reusables";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { logout } from "@/features/access/access.service";
import { clearAuthSession } from "@/shared/auth/authToken.utils";
import { getMyCompany } from "@/features/companies/company.service";

export function SaaSLayout() {
  const { t } = useTranslation("commons", { keyPrefix: "saasSidebar" });
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const navigate = useNavigate();
  const location = useLocation();
  const [companyType, setCompanyType] = useState<"SUPPLIER" | "DEMANDANT" | null>(null);

  useEffect(() => {
    let active = true;
    getMyCompany().then((company) => {
      if (active) setCompanyType(company?.type ?? null);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [location.pathname]);

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Always end the browser session, even if the remote revoke is unavailable.
    } finally {
      clearAuthSession();
      navigate(routePaths.login(lang), { replace: true });
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar>
        {companyType && <SidebarOption to={routePaths.inbox(lang)} icon="user" content={t("messages")} />}
        <SidebarOption to={routePaths.ownUserProfile(lang)} icon="user" content={t("userProfile")} />
        <SidebarOption to={routePaths.ownCompanyProfile(lang)} icon="building" content={t("companyProfile")} />
        {companyType === "SUPPLIER" && <SidebarOption to={routePaths.solarPanelModelsCrud(lang)} icon="settings" content={t("solarPanelModels")} />}
        <SidebarOption to={routePaths.settings(lang)} icon="settings" content={t("settings")} />
        <li><button type="button" onClick={() => void handleLogout()} className="px-3 py-2 hover:text-orange">{t("logout")}</button></li>
      </Sidebar>

      <div className="w-full">
        <Outlet />
      </div>
    </div>
  );
}
