import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { getMyPlatformAdmin } from "@/features/platform-admin/platformAdmin.service";

interface RequirePlatformAdminProps {
  children: ReactNode;
}

export default function RequirePlatformAdmin({ children }: RequirePlatformAdminProps) {
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const [isPlatformAdmin, setIsPlatformAdmin] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    let active = true;
    getMyPlatformAdmin().then((admin) => {
      if (active) setIsPlatformAdmin(admin !== null);
    }).catch(() => {
      if (active) setIsPlatformAdmin(false);
    });
    return () => { active = false; };
  }, []);

  if (isPlatformAdmin === undefined) return <p className="p-6">Carregando…</p>;
  if (!isPlatformAdmin) return <Navigate to={routePaths.dashboard(lang)} replace />;
  return <>{children}</>;
}
