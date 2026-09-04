import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import i18n from "@/config/inter/internationalization";
import { detectLanguage, isSupportedLanguage } from "@/config/inter/browser/languages";

export default function LanguageLayout() {
  const { lang } = useParams<{ lang: string }>();
  const location = useLocation();
  const supported = isSupportedLanguage(lang);

  useEffect(() => {
    if (supported && lang && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [supported, lang]);

  if (!supported) {
    const [, , ...rest] = location.pathname.split("/");
    const redirectPath = `/${detectLanguage()}${rest.length ? `/${rest.join("/")}` : ""}`;
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}

export function RootRedirect() {
  return <Navigate to={`/${detectLanguage()}`} replace />;
}
