import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { DEFAULT, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import { reloadCurrentFirebaseUser } from "@/config/firebase/auth/auth.service";
import { getAuthSession } from "@/shared/auth/authToken.utils";
import { useTranslation } from "react-i18next";

export default function RequireVerifiedEmail({ children }: { children: ReactNode }) {
  const { t } = useTranslation("saas");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT;
  const [verified, setVerified] = useState<boolean | null>(isAlwaysMockMode() ? true : null);
  useEffect(() => {
    if (isAlwaysMockMode()) return;
    let active = true;
    reloadCurrentFirebaseUser()
      .then((user) => {
        if (active) setVerified(Boolean(user?.emailVerified && user.email?.toLowerCase() === getAuthSession()?.email.toLowerCase()));
      })
      .catch(() => {
        if (active) setVerified(false);
      });
    return () => {
      active = false;
    };
  }, []);
  if (verified === null) return <OperationalPage title={t("navigation.items.messages")} loading />;
  return verified ? children : <Navigate to={routePaths.verifyEmail(lang)} replace />;
}
