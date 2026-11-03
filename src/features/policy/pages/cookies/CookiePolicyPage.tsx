import { useTranslation } from "react-i18next";
import OperationalPage from "@@/layout/operational-page/OperationalPage";

export default function CookiePolicyPage() {
  const { t } = useTranslation("policy");
  return <OperationalPage title={t("cookies")} description={t("pending")} centered sideBackground />;
}
