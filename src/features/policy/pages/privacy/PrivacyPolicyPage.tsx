import { useTranslation } from "react-i18next";
import OperationalPage from "@@/layout/operational-page/OperationalPage";

export default function PrivacyPolicyPage() {
  const { t } = useTranslation("policy");
  return <OperationalPage title={t("privacy")} description={t("pending")} centered sideBackground />;
}
