import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import { getAccountIdentity } from "@/features/access/access.credentials.service";

import { useTranslation } from "react-i18next";

export default function RequireVerifiedEmail({ children }: { children: ReactNode }) {
  const { t } = useTranslation("saas");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT;
  const [verified, setVerified] = useState<boolean | null>(isAlwaysMockMode("AUTH") ? true : null);
  useEffect(() => {
    if (isAlwaysMockMode("AUTH")) return;
    let active = true;
    getAccountIdentity()
      .then((user) => {
        if (active) setVerified(Boolean(user?.emailVerified));
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
