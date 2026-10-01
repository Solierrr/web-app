import { useTranslation } from "react-i18next";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { getMyPlatformAdmin } from "@/features/platform-admin/platformAdmin.service";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";

interface RequirePlatformAdminProps {
  children: ReactNode;
}

export default function RequirePlatformAdmin({ children }: RequirePlatformAdminProps) {
  const { t } = useTranslation("saas");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const [isPlatformAdmin, setIsPlatformAdmin] = useState<boolean | undefined>(isAlwaysMockMode() ? true : undefined);

  useEffect(() => {
    if (isAlwaysMockMode()) return;
    let active = true;
    getMyPlatformAdmin()
      .then((admin) => {
        if (active) setIsPlatformAdmin(admin !== null);
      })
      .catch(() => {
        if (active) setIsPlatformAdmin(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (isPlatformAdmin === undefined) return <OperationalPage title={t("navigation.items.registrations")} loading />;
  if (!isPlatformAdmin) return <Navigate to={routePaths.dashboard(lang)} replace />;
  return <>{children}</>;
}
