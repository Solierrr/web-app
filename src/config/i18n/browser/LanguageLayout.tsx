import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import i18n from "@/config/i18n/internationalization";
import { detectLanguage, isSupportedLanguage, rememberLanguage } from "@/config/i18n/browser/languages";
import { localizePath, resolveLanguage } from "../routing/routing";

export default function LanguageLayout() {
  const { lang } = useParams<{ lang: string }>();
  const location = useLocation();
  const supported = isSupportedLanguage(lang);

  useEffect(() => {
    if (!supported || !lang) return;
    document.documentElement.lang = lang;
    rememberLanguage(lang);
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [supported, lang]);

  if (!supported) {
    const language = resolveLanguage(
      location.pathname,
      document.cookie,
      (navigator.languages?.length ? navigator.languages : [navigator.language]).join(","),
    );
    const redirectPath = localizePath(location.pathname, language);
    return <Navigate to={redirectPath + location.search + location.hash} state={location.state} replace />;
  }

  return <Outlet />;
}

export function RootRedirect() {
  const location = useLocation();
  return <Navigate to={`/${detectLanguage()}${location.search}${location.hash}`} state={location.state} replace />;
}
