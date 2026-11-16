import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { refresh } from "@/features/access/access.service";
import { clearAuthSession, getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import Loading from "@@/helpers/accessibility/loading/Loading";
import { WhiteButton } from "@@/ui/button/Button.presets";
import { HttpResponseError } from "@/lib/shared/http/http.service";

export default function RequireAuth() {
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onSessionChange = () => { if (active && !getAuthSession()) setAuthenticated(false); };
    window.addEventListener("solaria:session", onSessionChange);

    async function ensureSession() {
      const stored = getAuthSession();
      if (stored?.isMock && !isAlwaysMockMode("AUTH")) {
        if (active) setAuthenticated(false);
        return;
      }
      try {
        const expiresAt = stored ? new Date(stored.accessTokenExpiresAt).getTime() : 0;
        const session = stored && expiresAt - Date.now() > 60_000 ? stored : await refresh();
        if (!session) { if (active) setAuthenticated(false); return; }
        if (!active) return;
        setAuthenticated(true);
        const nextRefresh = new Date(session.accessTokenExpiresAt).getTime() - Date.now() - 60_000;
        timer = setTimeout(() => void ensureSession(), Math.max(1000, nextRefresh));
      } catch (error) {
        if (!active) return;
        if (error instanceof Error && error.cause instanceof HttpResponseError && error.cause.status === 401) {
          clearAuthSession(); setAuthenticated(false);
        } else setUnavailable(true);
      }
    }

    void ensureSession();

    return () => {
      active = false;
      window.removeEventListener("solaria:session", onSessionChange);
      if (timer) clearTimeout(timer);
    };
  }, [attempt]);

  if (unavailable) return <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
    <p role="alert">Não foi possível restaurar sua sessão agora.</p>
    <WhiteButton content="Tentar novamente" description="Restaurar a sessão salva" onClick={() => { setUnavailable(false); setAuthenticated(null); setAttempt(value => value + 1); }} />
  </div>;
  if (authenticated === null)
    return <Loading />;
  if (!authenticated) {
    return <Navigate to={routePaths.login(lang)} replace state={{ returnTo: `${location.pathname}${location.search}${location.hash}` }} />;
  }
  return <Outlet />;
}
