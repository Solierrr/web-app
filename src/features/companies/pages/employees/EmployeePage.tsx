import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { DEFAULT, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { useActiveContext } from "@/shared/context/ActiveContext";
import { getUser } from "@/features/users/user/user.service";
import { listEmployees, type Employee } from "@/features/companies/companyManagement.service";
import Permissions from "@/features/permissions/Permissions";

export default function EmployeePage() {
  const { t } = useTranslation("saas");
  const { employeeId, lang: parameter } = useParams<{ employeeId: string; lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const { company, can = () => false } = useActiveContext();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [name, setName] = useState("");
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
          setEmployee(item);
          setName(user?.username ?? item.userId);
        }
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [company, employeeId]);

  return (
    <OperationalPage
      title={name || t("navigation.items.employees")}
      loading={loading}
      compact
      actions={<Link to={routePaths.employeesManagement(lang)}>{t("details.back")}</Link>}>
      {error ? (
        <p role="alert">{t("details.error")}</p>
      ) : (
        employee && (
          <>
            <dl className="grid gap-3 rounded-small border border-operational-border p-4">
              <div>
                <dt className="text-sm text-operational-muted">{t("details.position")}</dt>
                <dd>{employee.position.name}</dd>
              </div>
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
