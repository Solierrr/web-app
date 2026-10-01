import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { refresh } from "@/features/access/access.service";
import { clearAuthSession, getAuthSession } from "@/shared/auth/authToken.utils";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import OperationalLoading from "@@/feedback/operational-loading/OperationalLoading";

export default function RequireAuth() {
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function ensureSession() {
      const stored = getAuthSession();
      if (!stored || (stored.isMock && !isAlwaysMockMode())) {
        if (active) setAuthenticated(false);
        return;
      }
      try {
        const expiresAt = new Date(stored.accessTokenExpiresAt).getTime();
        const session = expiresAt - Date.now() > 60_000 ? stored : await refresh();
        if (!session) throw new Error("Sessão indisponível");
        if (!active) return;
        setAuthenticated(true);
        const nextRefresh = new Date(session.accessTokenExpiresAt).getTime() - Date.now() - 60_000;
        timer = setTimeout(() => void ensureSession(), Math.max(1000, nextRefresh));
      } catch {
        clearAuthSession();
        if (active) setAuthenticated(false);
      }
    }

    void ensureSession();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (authenticated === null) return <OperationalLoading />;
  if (!authenticated) {
    return <Navigate to={routePaths.login(lang)} replace state={{ returnTo: `${location.pathname}${location.search}${location.hash}` }} />;
  }
  return <Outlet />;
}
