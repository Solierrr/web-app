import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@@/ui/icon/Icon";
import LanguageSwitcher from "@@/layout/navbar/LanguageSwitcher";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { logout } from "@/features/access/access.service";
import { getOperationalContext } from "@/features/saas/saas.service";
import type { OperationalContext } from "@/features/saas/saas";
import { clearAuthSession, getAuthSession } from "@/shared/auth/authToken.utils";

export default function Navbar() {
  const { t } = useTranslation("commons", { keyPrefix: "navbar" });
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const navigate = useNavigate();
  const [session, setSession] = useState(getAuthSession);
  const [context, setContext] = useState<OperationalContext | null>(null);
  const [contextLoading, setContextLoading] = useState(Boolean(getAuthSession()));

  useEffect(() => {
    function syncSession() {
      setSession(getAuthSession());
    }

    window.addEventListener("storage", syncSession);
    return () => window.removeEventListener("storage", syncSession);
  }, []);

  useEffect(() => {
    if (!session) {
      setContext(null);
      setContextLoading(false);
      return;
    }

    let current = true;
    setContextLoading(true);
    getOperationalContext()
      .then((operationalContext) => {
        if (current) setContext(operationalContext);
      })
      .catch(() => {
        if (current) setContext(null);
      })
      .finally(() => {
        if (current) setContextLoading(false);
      });

    return () => {
      current = false;
    };
  }, [session?.userId]);

  async function handleLogout() {
    try {
      await logout();
    } catch {
      clearAuthSession();
    }
    setSession(null);
    setContext(null);
    navigate(routePaths.home(lang));
  }

  const operationalPath = context?.companyType === "SUPPLIER"
    ? routePaths.supplierDashboard(lang)
    : context?.companyType === "DEMANDANT"
      ? routePaths.demandantDashboard(lang)
      : null;
  const professionalSession = Boolean(session && !context && !contextLoading);

  return (
    <header className="w-full">
      <div className="flex flex-row gap-8 w-full py-5.5 items-center justify-center *:font-semi-bold">
        {(!session || operationalPath) && (
          <>
            <Link to={routePaths.home(lang)}>{t("app")}</Link>
            <Link to={routePaths.solarPanelsFeed(lang)}>{t("solarPanels")}</Link>
            <Link to={routePaths.professionalsFeed(lang)}>{t("professionals")}</Link>
            {!session && <Link to={routePaths.register(lang)}>{t("accredit")}</Link>}
            <Link to={routePaths.chatbot(lang)}>{t("support")}</Link>
            <Link to={routePaths.searchSolarPanels(lang)}>
              <Icon name="search" />
            </Link>
            <Link to={routePaths.home(lang)}>
              <Icon name="shoppingCart" />
            </Link>
          </>
        )}
        {session && operationalPath && <Link to={operationalPath}>{t("operationalArea")}</Link>}
        {professionalSession && <Link to={routePaths.ownUserProfile(lang)}>{t("myProfile")}</Link>}
        {session && operationalPath && <Link to={routePaths.ownUserProfile(lang)}>{t("myProfile")}</Link>}
        {session && !contextLoading && <button type="button" onClick={handleLogout}>{t("logout")}</button>}
        <LanguageSwitcher />
      </div>
    </header>
  );
}
