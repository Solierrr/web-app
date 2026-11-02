import { useTranslation } from "react-i18next";
import OperationalPage from "@@/layout/operational-page/OperationalPage";

export default function TermsPolicyPage() {
  const { t } = useTranslation("policy");
  return <OperationalPage title={t("terms")} description={t("pending")} centered sideBackground />;
}
