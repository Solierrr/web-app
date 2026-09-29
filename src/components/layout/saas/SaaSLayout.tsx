import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "@@/layout/sidebar/Sidebar";
import { SidebarOption } from "@@/layout/sidebar/Sidebar.reusables";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { logout } from "@/features/access/access.service";
import { clearAuthSession } from "@/shared/auth/authToken.utils";
import { ActiveContextProvider, useActiveContext } from "@/shared/context/ActiveContext";

function ContextIndicator() {
  const { t } = useTranslation("commons", { keyPrefix: "saasContext" });
  const { kind, company, isAdmin, hasCompany, setKind } = useActiveContext();

  const roleLabel = kind === "personal" ? t("personal") : isAdmin ? t("admin") : t("member");
  const scopeLabel = kind === "personal" ? t("personal") : company?.tradeName ?? "";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-6 py-3 text-sm">
      <span className="text-gray-600">
        {roleLabel} · <span className="font-medium text-black">{scopeLabel}</span>
      </span>
      {hasCompany && (
        <div className="flex rounded-full bg-input-bg p-1">
          <button
            type="button"
            onClick={() => setKind("personal")}
            className={`rounded-full px-3 py-1 font-medium ${kind === "personal" ? "bg-white text-orange" : "text-input-text"}`}
          >
            {t("personal")}
          </button>
          <button
            type="button"
            onClick={() => setKind("company")}
            className={`rounded-full px-3 py-1 font-medium ${kind === "company" ? "bg-white text-orange" : "text-input-text"}`}
          >
            {company?.tradeName ?? t("company")}
          </button>
        </div>
      )}
    </div>
  );
}

function SaaSSidebar() {
  const { t } = useTranslation("commons", { keyPrefix: "saasSidebar" });
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const navigate = useNavigate();
  const { kind, company, hasCompany } = useActiveContext();
  const companyType = kind === "company" ? company?.type ?? null : null;

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
    <Sidebar>
      <SidebarOption to={routePaths.dashboard(lang)} icon="user" content={t("dashboard")} />
      {hasCompany && kind === "company" && <SidebarOption to={routePaths.inbox(lang)} icon="user" content={t("messages")} />}
      <SidebarOption to={routePaths.ownUserProfile(lang)} icon="user" content={t("userProfile")} />
      {hasCompany && kind === "company" && <SidebarOption to={routePaths.ownCompanyProfile(lang)} icon="building" content={t("companyProfile")} />}
      {companyType === "SUPPLIER" && <SidebarOption to={routePaths.solarPanelModelsCrud(lang)} icon="settings" content={t("solarPanelModels")} />}
      {companyType === "SUPPLIER" && <SidebarOption to={routePaths.offersManagement(lang)} icon="settings" content={t("offers")} />}
      {hasCompany && kind === "company" && <SidebarOption to={routePaths.employeesManagement(lang)} icon="user" content={t("employees")} />}
      <SidebarOption to={routePaths.settings(lang)} icon="settings" content={t("settings")} />
      <li><button type="button" onClick={() => void handleLogout()} className="px-3 py-2 hover:text-orange">{t("logout")}</button></li>
    </Sidebar>
  );
}

function SaaSLayoutContent() {
  return (
    <div className="flex min-h-screen">
      <SaaSSidebar />

      <div className="w-full">
        <ContextIndicator />
        <Outlet />
      </div>
    </div>
  );
}

export function SaaSLayout() {
  return (
    <ActiveContextProvider>
      <SaaSLayoutContent />
    </ActiveContextProvider>
  );
}
