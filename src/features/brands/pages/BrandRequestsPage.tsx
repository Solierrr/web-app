import { useTranslation } from "react-i18next";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import BrandRequestsTable from "../requests/BrandRequestsTable";
export default function BrandRequestsPage() {
  const { t } = useTranslation("brands");
  return (
    <OperationalPage title={t("requests")} description={t("requestsDescription")} centered sideBackground>
      <BrandRequestsTable />
    </OperationalPage>
  );
}
