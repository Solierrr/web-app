import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { DEFAULT, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { getPermissionTemplate, isPermissionCompatible, permissionTemplates } from "@/features/permissions/permissions.utils";

import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { getUser } from "@/features/users/user/user.service";
import {
  createPosition,
  grantPermission,
  listPermissions,
  generateAccessCode,
  linkPositionToCompany,
  listAccessCodes,
  listCompanyPositions,
  listEmployees,
  removeEmployee,
  revokeAccessCode,
  updateEmployeePosition,
  type AccessCode,
  type Employee,
  type Position,
  type Permission,
} from "@/features/companies/company.management.service";

interface EmployeeRow extends Employee {
  username: string;
}

export default function EmployeesPage() {
  const { t } = useTranslation("commons", { keyPrefix: "employees" });
  const { t: tSaas } = useTranslation("saas");
  const { company, can = () => false, loading: contextLoading } = useActiveContext();
  const { lang: parameter } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const canInvite = can("POST /api/access-codes");
  const canCreatePosition =
    can("POST /api/positions") && can("POST /api/company-positions") && can("POST /api/position-permissions") && can("GET /api/permissions");
  const companyId = company?.id;

  const [employees, setEmployees] = useState<EmployeeRow[] | null>(null);
  const [companyPositions, setCompanyPositions] = useState<Position[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [error, setError] = useState(false);

  const [selectedPositionId, setSelectedPositionId] = useState("");
  const [newPositionName, setNewPositionName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [newPermissions, setNewPermissions] = useState<string[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(canCreatePosition && Boolean(company?.type));

  useEffect(() => {
    let active = true;
    if (!canCreatePosition || !company?.type) return;
    const type = company.type;
    listPermissions()
      .then((items) => {
        if (!active) return;
        const compatible = items.filter((item) => isPermissionCompatible(item.permissionName, type) && can(item.permissionName));
        setAvailablePermissions(compatible);
        const template = getPermissionTemplate("Consulta");
        setNewPermissions(compatible.filter((item) => template?.permissions.includes(item.permissionName)).map((item) => item.id));
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setPermissionsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [companyId, canCreatePosition]);

  async function load(id: string) {
    const [employeeLinks, positions, codes] = await Promise.all([
      listEmployees(id),
      can("GET /api/company-positions/company/{companyId}") ? listCompanyPositions(id) : Promise.resolve([]),
      can("GET /api/access-codes/company/{companyId}") ? listAccessCodes(id) : Promise.resolve([]),
    ]);
    const withNames = await Promise.all(
      employeeLinks.map(async (employee) => {
        try {
          const user = await getUser(employee.userId);
          return { ...employee, username: user.username };
        } catch {
          return { ...employee, username: employee.userId };
        }
      }),
    );
    return { employees: withNames, positions: positions.map((link) => link.position), codes: codes.filter((code) => code.status === "ACTIVE") };
  }

  function apply(data: Awaited<ReturnType<typeof load>>) {
    setEmployees(data.employees);
    setCompanyPositions(data.positions);
    setAccessCodes(data.codes);
  }

  async function reload(id: string) {
    try {
      apply(await load(id));
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    if (!companyId) return;
    let active = true;
    load(companyId)
      .then((data) => {
        if (active) apply(data);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [companyId, canInvite]);

  async function handleGenerateCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!companyId) return;
    setGenerating(true);
    setGeneratedCode(null);
    try {
      let positionId = selectedPositionId;
      if (!positionId && newPositionName.trim()) {
        const position = await createPosition(newPositionName.trim());
        await linkPositionToCompany(companyId, position.id);
        for (const permissionId of newPermissions) await grantPermission(position.id, permissionId);
        positionId = position.id;
      }
      if (!positionId) return;
      const code = await generateAccessCode(companyId, positionId);
      setGeneratedCode(code.code);
      setNewPositionName("");
      await reload(companyId);
    } catch {
      setError(true);
    } finally {
      setGenerating(false);
    }
  }

  async function handleChangePosition(employeeId: string, positionId: string) {
    if (!companyId) return;
    try {
      await updateEmployeePosition(employeeId, positionId);
      await reload(companyId);
    } catch {
      setError(true);
    }
  }

  async function handleRemove(employeeId: string) {
    if (!companyId) return;
    try {
      await removeEmployee(employeeId);
      await reload(companyId);
    } catch {
      setError(true);
    }
  }

  async function handleRevokeCode(codeId: string) {
    if (!companyId) return;
    try {
      await revokeAccessCode(codeId, companyId);
      await reload(companyId);
    } catch {
      setError(true);
    }
  }

  if (error)
    return (
      <OperationalPage title={t("title")}>
        <p role="alert">{t("loadError")}</p>
      </OperationalPage>
    );
  if (contextLoading || !employees) return <OperationalPage title={t("title")} loading />;

  return (
    <OperationalPage title={t("title")}>
      <section className="flex flex-col gap-3">
        <h2 className="font-medium">{t("listTitle")}</h2>
        <ul className="divide-y divide-operational-border rounded-small border border-operational-border">
          {employees.map((employee) => (
            <li key={employee.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <Link className="font-medium hover:underline" to={`${routePaths.employeesManagement(lang)}/${encodeURIComponent(employee.id)}`}>
                  {employee.username}
                </Link>
                <p className="text-sm text-gray-600">{employee.position.name}</p>
              </div>
              {employee.position.name !== "ADMIN" ? (
                <div className="flex items-center gap-2">
                  {can("PATCH /api/user-companies/{id}/position") && companyPositions.length > 0 && (
                    <select
                      value={employee.position.id}
                      onChange={(event) => void handleChangePosition(employee.id, event.target.value)}
                      className="rounded-small border border-operational-border p-1 text-sm">
                      {companyPositions.map((position) => (
                        <option key={position.id} value={position.id}>
                          {position.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {can("DELETE /api/user-companies/{id}") && (
                    <button type="button" onClick={() => void handleRemove(employee.id)} className="text-sm text-red-700">
                      {t("remove")}
                    </button>
                  )}
                </div>
              ) : null}
            </li>
          ))}
          {employees.length === 0 ? <li className="p-4 text-gray-600">{t("empty")}</li> : null}
        </ul>
      </section>

      {canInvite || can("GET /api/access-codes/company/{companyId}") ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-medium">{t("inviteTitle")}</h2>
          {canInvite && (
            <form onSubmit={handleGenerateCode} className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-sm">
                {t("existingPosition")}
                <select
                  value={selectedPositionId}
                  onChange={(event) => {
                    setSelectedPositionId(event.target.value);
                    setNewPositionName("");
                  }}
                  className="rounded-small border border-operational-border p-2">
                  <option value="">{t("selectPosition")}</option>
                  {companyPositions
                    .filter((position) => position.name !== "ADMIN")
                    .map((position) => (
                      <option key={position.id} value={position.id}>
                        {position.name}
                      </option>
                    ))}
                </select>
              </label>
              <span className="text-sm text-gray-500">{t("or")}</span>
              {canCreatePosition && (
                <label className="flex flex-col gap-1 text-sm">
                  {t("newPosition")}
                  <input
                    value={newPositionName}
                    onChange={(event) => {
                      setNewPositionName(event.target.value);
                      setSelectedPositionId("");
                    }}
                    maxLength={12}
                    placeholder={t("newPositionPlaceholder")}
                    className="rounded-small border border-operational-border p-2"
                  />
                </label>
              )}
              {newPositionName.trim() && (
                <fieldset disabled={generating || permissionsLoading} className="flex w-full flex-col gap-3">
                  <legend className="mb-2 font-medium">{tSaas("permissions.title")}</legend>
                  <label className="flex flex-col gap-2 text-sm">
                    {tSaas("permissions.template")}
                    <select
                      defaultValue="Consulta"
                      className="rounded-small border border-operational-border p-2"
                      onChange={(event) => {
                        const template = getPermissionTemplate(event.target.value);
                        if (template)
                          setNewPermissions(
                            availablePermissions.filter((item) => template.permissions.includes(item.permissionName)).map((item) => item.id),
                          );
                      }}>
                      {permissionTemplates
                        .filter((item) => company?.type && item.companyTypes.includes(company.type))
                        .map((item) => (
                          <option key={item.title} value={item.title}>
                            {item.title}
                          </option>
                        ))}
                    </select>
                  </label>
                  {availablePermissions.map((item) => (
                    <label key={item.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={newPermissions.includes(item.id)}
                        onChange={(event) =>
                          setNewPermissions((items) => (event.target.checked ? [...items, item.id] : items.filter((id) => id !== item.id)))
                        }
                      />
                      {item.name}
                    </label>
                  ))}
                </fieldset>
              )}
              <button
                type="submit"
                disabled={generating || permissionsLoading || (!selectedPositionId && (!canCreatePosition || !newPositionName.trim()))}
                className="rounded-small bg-orange px-4 py-2 text-white disabled:opacity-50">
                {t("generate")}
              </button>
            </form>
          )}
          {generatedCode ? (
            <p role="status" className="rounded-small bg-green-50 p-3 text-sm">
              {t("generatedCode", { code: generatedCode })}
            </p>
          ) : null}

          <h3 className="mt-2 text-sm font-medium">{t("activeCodesTitle")}</h3>
          <ul className="divide-y divide-operational-border rounded-small border border-operational-border">
            {accessCodes.map((code) => (
              <li key={code.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                <span className="font-mono">{code.code}</span>
                <span className="text-gray-600">{code.position.name}</span>
                {can("DELETE /api/access-codes/{id}/company/{companyId}") && (
                  <button type="button" onClick={() => void handleRevokeCode(code.id)} className="text-red-700">
                    {t("revoke")}
                  </button>
                )}
              </li>
            ))}
            {accessCodes.length === 0 ? <li className="p-3 text-gray-600">{t("noActiveCodes")}</li> : null}
          </ul>
        </section>
      ) : null}
    </OperationalPage>
  );
}
