import { useTranslation } from "react-i18next";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { getMyCompany } from "@/features/companies/company.service";
import { getSelectedContext } from "../access.onboarding.service";
import { CompanyStatus } from "@/features/companies/company.enum";
import { useActiveContext } from "@/shared/context/ActiveContext";

interface RequireCompanyProps {
  children: ReactNode;
  type?: "SUPPLIER" | "DEMANDANT";
  permission?: string;
}

function subscribeContext(listener: () => void) {
  window.addEventListener("solaria:context", listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener("solaria:context", listener);
    window.removeEventListener("storage", listener);
  };
}

export default function RequireCompany({ children, type, permission }: RequireCompanyProps) {
  const { can = () => false, loading: contextLoading } = useActiveContext();
  const { t } = useTranslation("saas");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const selectedContext = useSyncExternalStore(subscribeContext, getSelectedContext, () => null);
  const [loadedContext, setLoadedContext] = useState<string | null | undefined>(undefined);
  const [companyType, setCompanyType] = useState<"SUPPLIER" | "DEMANDANT" | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    getMyCompany()
      .then((company) => {
        if (active) {
          setLoadedContext(selectedContext);
          setCompanyType(company?.status === CompanyStatus.APPROVED && getSelectedContext() !== "personal" ? (company.type ?? null) : null);
        }
      })
      .catch(() => {
        if (active) {
          setLoadedContext(selectedContext);
          setCompanyType(null);
        }
      });
    return () => {
      active = false;
    };
  }, [selectedContext]);

  if (contextLoading || loadedContext !== selectedContext || companyType === undefined)
    return <OperationalPage title={t("navigation.items.companyProfile")} loading />;
  if (selectedContext === "personal") return <Navigate to={routePaths.settings(lang)} replace />;
  if (!companyType || (type && companyType !== type)) {
    return <Navigate to={routePaths.ownCompanyProfile(lang)} replace />;
  }
  if (permission && !can(permission)) return <Navigate to={routePaths.dashboard(lang)} replace />;
  return <>{children}</>;
}
