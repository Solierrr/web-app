import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { getMyCompany } from "@/features/companies/company.service";

interface RequireCompanyProps {
  children: ReactNode;
  type?: "SUPPLIER" | "DEMANDANT";
}

export default function RequireCompany({ children, type }: RequireCompanyProps) {
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const [companyType, setCompanyType] = useState<"SUPPLIER" | "DEMANDANT" | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    getMyCompany().then((company) => {
      if (active) setCompanyType(company?.type ?? null);
    }).catch(() => {
      if (active) setCompanyType(null);
    });
    return () => { active = false; };
  }, []);

  if (companyType === undefined) return <p className="p-6">Carregando empresa…</p>;
  if (!companyType || (type && companyType !== type)) {
    return <Navigate to={routePaths.ownCompanyProfile(lang)} replace />;
  }
  return <>{children}</>;
}
