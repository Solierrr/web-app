import OperationalTable from "@@/layout/operational-page/OperationalTable";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import ConfirmedAction from "@@/overlay/confirmation/ConfirmedAction";
import Checkbox from "@@/ui/checkbox/Checkbox";
import { PrimaryButton, WhiteButton } from "@@/ui/button/Button.presets";
import Input from "@@/ui/input/Input";
import { NativeSelect as Select } from "@@/ui/select/Select";
import OperationalForm from "@@/layout/operational-page/OperationalForm";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { getPermissionTemplate, isPermissionCompatible, permissionTemplates } from "@/features/permissions/permissions.utils";

import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { getUser } from "@/features/users/user/user.service";
import { isSafeMailtoAddress } from "@/lib/utils/validation.utils";
import {
  createPosition,
  grantPermission,
  listPermissions,
  generateAccessCode,
  listAccessCodes,
  listPositions,
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
  const { company, can = () => false, loading: contextLoading, isAdmin } = useActiveContext();
  const { lang: parameter } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const canInvite = can("POST /api/access-codes");
  const canCreatePosition = can("POST /api/positions") && can("POST /api/position-permissions") && can("GET /api/permissions");
  const { t: tCommon } = useTranslation("commons");
  const [formOpen, setFormOpen] = useState(false);
  const companyId = company?.id;

  const [employees, setEmployees] = useState<EmployeeRow[] | null>(null);
  const [companyPositions, setCompanyPositions] = useState<Position[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [error, setError] = useState(false);

  const [selectedPositionId, setSelectedPositionId] = useState("");
  const [newPositionName, setNewPositionName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [guestEmail, setGuestEmail] = useState("");
  const [invitedEmail, setInvitedEmail] = useState("");
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
      can("GET /api/positions") ? listPositions() : Promise.resolve([]),
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
    return { employees: withNames, positions, codes: codes.filter((code) => code.status === "ACTIVE") };
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
        for (const permissionId of newPermissions) await grantPermission(position.id, permissionId);
        positionId = position.id;
      }
      if (!positionId) return;
      const code = await generateAccessCode(companyId, positionId);
      setGeneratedCode(code.code);
      setInvitedEmail(isSafeMailtoAddress(guestEmail.trim()) ? guestEmail.trim() : "");
      setGuestEmail("");
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
    if (!companyId) throw new Error("Missing company");
    try {
      await removeEmployee(employeeId);
      await reload(companyId);
    } catch {
      throw new Error(t("loadError"));
    }
  }

  async function handleRevokeCode(codeId: string) {
    if (!companyId) throw new Error("Missing company");
    try {
      await revokeAccessCode(codeId, companyId);
      await reload(companyId);
    } catch {
      throw new Error(t("loadError"));
    }
  }

  if (error)
    return (
      <OperationalPage title={t("title")} centered sideBackground>
        <p role="alert">{t("loadError")}</p>
      </OperationalPage>
    );
  if (contextLoading || !employees) return <OperationalPage title={t("title")} loading />;

  return (
    <OperationalPage
      description={!formOpen ? t("description") : undefined}
      centered
      sideBackground={!formOpen}
      form={formOpen}
      formBackground={formOpen}
      title={formOpen ? t("inviteTitle") : t("title")}
      actions={
        !formOpen && canInvite ? (
          <PrimaryButton
            content={t("inviteTitle")}
            description={t("inviteTitle")}
            onClick={() => {
              setFormOpen(true);
              setGeneratedCode(null);
            }}
          />
        ) : undefined
      }>
      {!formOpen && (
        <OperationalTable
          label={t("listTitle")}
          items={employees}
          onRefresh={async () => apply(await load(companyId!))}
          getKey={(employee) => employee.id}
          empty={t("empty")}
          columns={[
            {
              key: "name",
              label: tCommon("settings.profile"),
              render: (employee) => (
                <Link className="font-medium hover:underline" to={`${routePaths.employeesManagement(lang)}/${encodeURIComponent(employee.id)}`}>
                  {employee.username}
                </Link>
              ),
            },
            {
              key: "position",
              value: (employee) => employee.position.name,
              filterable: true,
              label: tSaas("details.position"),
              render: (employee) =>
                employee.position.name === "ADMIN" || !can("PATCH /api/user-companies/{id}/position") || !companyPositions.length ? (
                  employee.position.name
                ) : (
                  <Select
                    name={`position-${employee.id}`}
                    aria-label={`${tSaas("details.position")} ${employee.username}`}
                    value={employee.position.id}
                    onChange={(event) => void handleChangePosition(employee.id, event.target.value)}
                    className="w-full">
                    {companyPositions
                      .filter((position) => position.name !== "ADMIN" || isAdmin)
                      .map((position) => (
                        <option key={position.id} value={position.id}>
                          {position.name}
                        </option>
                      ))}
                  </Select>
                ),
            },
            {
              key: "actions",
              label: tCommon("operational.actions"),
              render: (employee) => (
                <div className="flex items-center gap-2">
                  <ToolbarAction
                    icon="eye"
                    label={tCommon("actions.view")}
                    to={`${routePaths.employeesManagement(lang)}/${encodeURIComponent(employee.id)}`}
                    backgroundColor="var(--color-input-bg)"
                    className="h-8!"
                  />
                  {employee.position.name !== "ADMIN" && can("DELETE /api/user-companies/{id}") && (
                    <ConfirmedAction label={t("remove")} name={employee.username} onConfirm={() => handleRemove(employee.id)} />
                  )}
                </div>
              ),
            },
          ]}
        />
      )}

      {canInvite || can("GET /api/access-codes/company/{companyId}") ? (
        <section className="flex flex-col gap-3">
          {formOpen && canInvite && (
            <OperationalForm plain onSubmit={handleGenerateCode}>
              <label className="flex flex-col gap-1 text-body">
                {t("existingPosition")}
                <Select
                  name="selectedPositionId"
                  aria-label={t("existingPosition")}
                  value={selectedPositionId}
                  onChange={(event) => {
                    setSelectedPositionId(event.target.value);
                    setNewPositionName("");
                  }}
                  className="w-full">
                  <option value="">{t("selectPosition")}</option>
                  {companyPositions
                    .filter((position) => position.name !== "ADMIN" || isAdmin)
                    .map((position) => (
                      <option key={position.id} value={position.id}>
                        {position.name}
                      </option>
                    ))}
                </Select>
              </label>
              <label className="flex flex-col gap-1 text-body">
                {t("guestEmail")}
                <Input
                  name="guestEmail"
                  aria-label={t("guestEmail")}
                  placeholder={t("guestEmail")}
                  type="email"
                  value={guestEmail}
                  onChange={(event) => setGuestEmail(event.target.value)}
                  className="w-full"
                />
              </label>
              <span className="text-body text-operational-muted">{t("or")}</span>
              {canCreatePosition && (
                <label className="flex flex-col gap-1 text-body">
                  {t("newPosition")}
                  <Input
                    name="newPositionName"
                    aria-label={t("newPosition")}
                    value={newPositionName}
                    onChange={(event) => {
                      setNewPositionName(event.target.value);
                      setSelectedPositionId("");
                    }}
                    maxLength={12}
                    placeholder={t("newPositionPlaceholder")}
                    className="w-full"
                  />
                </label>
              )}
              {newPositionName.trim() && (
                <fieldset disabled={generating || permissionsLoading} className="flex w-full flex-col gap-3">
                  <legend className="mb-2 font-medium">{tSaas("permissions.title")}</legend>
                  <label className="flex flex-col gap-2 text-body">
                    {tSaas("permissions.template")}
                    <Select
                      name="permissionTemplate"
                      aria-label={tSaas("permissions.template")}
                      defaultValue="Consulta"
                      className="w-full"
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
                    </Select>
                  </label>
                  {availablePermissions.map((item) => (
                    <Checkbox
                      key={item.id}
                      label={item.name}
                      checked={newPermissions.includes(item.id)}
                      onChange={(event) =>
                        setNewPermissions((items) => (event.target.checked ? [...items, item.id] : items.filter((id) => id !== item.id)))
                      }
                    />
                  ))}
                </fieldset>
              )}
              <PrimaryButton
                type="submit"
                disabled={generating || permissionsLoading || (!selectedPositionId && (!canCreatePosition || !newPositionName.trim()))}
                className="min-h-12 w-full"
                content={t("generate")}
                description={t("generate")}
              />
              <WhiteButton
                type="button"
                content={tCommon("actions.cancel")}
                description={tCommon("actions.cancel")}
                onClick={() => setFormOpen(false)}
                disabled={generating}
                className="min-h-12 w-full"
              />
            </OperationalForm>
          )}
          {generatedCode ? (
            <p role="status" className="rounded-small bg-green-50 p-3 text-body">
              {t("generatedCode", { code: generatedCode })}
              {invitedEmail ? (
                <>
                  {" "}
                  <a
                    className="text-orange underline"
                    href={`mailto:${invitedEmail}?subject=${encodeURIComponent(t("emailSubject", { company: company?.tradeName ?? "" }))}&body=${encodeURIComponent(
                      t("emailBody", {
                        code: generatedCode,
                        company: company?.tradeName ?? "",
                        url: `${window.location.origin}${routePaths.activateAccess(lang)}`,
                      }),
                    )}`}>
                    {t("sendByEmail")}
                  </a>
                </>
              ) : null}
            </p>
          ) : null}

          {!formOpen && (
            <OperationalTable
              label={t("activeCodesTitle")}
              items={accessCodes}
              onRefresh={async () => apply(await load(companyId!))}
              getKey={(code) => code.id}
              empty={t("noActiveCodes")}
              columns={[
                { key: "code", label: t("activeCodesTitle"), render: (code) => <span className="font-mono">{code.code}</span> },
                { key: "position", label: tSaas("details.position"), render: (code) => code.position.name },
                {
                  key: "actions",
                  label: tCommon("operational.actions"),
                  render: (code) =>
                    can("DELETE /api/access-codes/{id}/company/{companyId}") ? (
                      <ConfirmedAction icon="x" label={t("revoke")} name={code.code} onConfirm={() => handleRevokeCode(code.id)} />
                    ) : null,
                },
              ]}
            />
          )}
        </section>
      ) : null}
    </OperationalPage>
  );
}
