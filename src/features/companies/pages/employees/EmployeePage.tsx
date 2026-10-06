import { DetailField } from "@@/layout/operational-page/OperationalDetails";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { getUser } from "@/features/users/user/user.service";
import { listEmployees, type Employee } from "@/features/companies/company.management.service";
import Permissions from "@/features/permissions/Permissions";

export default function EmployeePage() {
  const { t } = useTranslation("saas");
  const { employeeId, lang: parameter } = useParams<{ employeeId: string; lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const { company, can = () => false } = useActiveContext();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [name, setName] = useState("");
  const requestKey = `${company?.id}:${employeeId}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    if (!company) return;
    listEmployees(company.id)
      .then(async (items) => {
        const item = items.find((entry) => entry.id === employeeId);
        if (!item) throw new Error("Employee not found");
        const user = await getUser(item.userId).catch(() => null);
        if (active) {
          setError(false);
          setEmployee(item);
          setName(user?.username ?? item.userId);
        }
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          setLoadedKey(requestKey);
        }
      });
    return () => {
      active = false;
    };
  }, [company, employeeId, requestKey]);

  return (
    <OperationalPage
      title={name || t("navigation.items.employees")}
      loading={loading || loadedKey !== requestKey}
      compact
      centered
      sideBackground
      actions={<ToolbarAction to={routePaths.employeesManagement(lang)} icon="chevronLeft" label={t("details.back")} content={t("details.back")} />}>
      {error ? (
        <p role="alert">{t("details.error")}</p>
      ) : (
        employee && (
          <>
            <dl className="grid gap-3 rounded-surface border-ui bg-white shadow-surface p-6 sm:grid-cols-2">
              <DetailField label={t("details.position")} value={employee.position.name} />
            </dl>
            {company?.type &&
              employee.position.name !== "ADMIN" &&
              can("POST /api/position-permissions") &&
              can("DELETE /api/position-permissions/{id}") && <Permissions positionId={employee.position.id} companyType={company.type} />}
          </>
        )
      )}
    </OperationalPage>
  );
}
