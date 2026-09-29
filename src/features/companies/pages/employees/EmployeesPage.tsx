import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { useActiveContext } from "@/shared/context/ActiveContext";
import { getUser } from "@/features/users/user/user.service";
import {
  createPosition,
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
} from "@/features/companies/companyManagement.service";

interface EmployeeRow extends Employee {
  username: string;
}

export default function EmployeesPage() {
  const { t } = useTranslation("commons", { keyPrefix: "employees" });
  const { company, isAdmin, loading: contextLoading } = useActiveContext();
  const companyId = company?.id;

  const [employees, setEmployees] = useState<EmployeeRow[] | null>(null);
  const [companyPositions, setCompanyPositions] = useState<Position[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [error, setError] = useState(false);

  const [selectedPositionId, setSelectedPositionId] = useState("");
  const [newPositionName, setNewPositionName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  async function reload(id: string) {
    try {
      const [employeeLinks, positions, codes] = await Promise.all([
        listEmployees(id),
        listCompanyPositions(id),
        isAdmin ? listAccessCodes(id) : Promise.resolve([]),
      ]);
      const withNames = await Promise.all(employeeLinks.map(async (employee) => {
        try {
          const user = await getUser(employee.userId);
          return { ...employee, username: user.username };
        } catch {
          return { ...employee, username: employee.userId };
        }
      }));
      setEmployees(withNames);
      setCompanyPositions(positions.map((link) => link.position));
      setAccessCodes(codes.filter((code) => code.status === "ACTIVE"));
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    if (!companyId) return;
    void reload(companyId);
  }, [companyId, isAdmin]);

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

  if (contextLoading || !employees) return <main className="p-6">{t("loading")}</main>;
  if (error) return <main className="p-6"><p role="alert">{t("loadError")}</p></main>;

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 p-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">{t("listTitle")}</h2>
        <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
          {employees.map((employee) => (
            <li key={employee.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{employee.username}</p>
                <p className="text-sm text-gray-600">{employee.position.name}</p>
              </div>
              {isAdmin && employee.position.name !== "ADMIN" ? (
                <div className="flex items-center gap-2">
                  <select
                    value={employee.position.id}
                    onChange={(event) => void handleChangePosition(employee.id, event.target.value)}
                    className="rounded-lg border border-gray-300 p-1 text-sm"
                  >
                    {companyPositions.map((position) => (
                      <option key={position.id} value={position.id}>{position.name}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => void handleRemove(employee.id)} className="text-sm text-red-700">
                    {t("remove")}
                  </button>
                </div>
              ) : null}
            </li>
          ))}
          {employees.length === 0 ? <li className="p-4 text-gray-600">{t("empty")}</li> : null}
        </ul>
      </section>

      {isAdmin ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-medium">{t("inviteTitle")}</h2>
          <form onSubmit={handleGenerateCode} className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm">
              {t("existingPosition")}
              <select
                value={selectedPositionId}
                onChange={(event) => { setSelectedPositionId(event.target.value); setNewPositionName(""); }}
                className="rounded-lg border border-gray-300 p-2"
              >
                <option value="">{t("selectPosition")}</option>
                {companyPositions.filter((position) => position.name !== "ADMIN").map((position) => (
                  <option key={position.id} value={position.id}>{position.name}</option>
                ))}
              </select>
            </label>
            <span className="text-sm text-gray-500">{t("or")}</span>
            <label className="flex flex-col gap-1 text-sm">
              {t("newPosition")}
              <input
                value={newPositionName}
                onChange={(event) => { setNewPositionName(event.target.value); setSelectedPositionId(""); }}
                maxLength={12}
                placeholder={t("newPositionPlaceholder")}
                className="rounded-lg border border-gray-300 p-2"
              />
            </label>
            <button type="submit" disabled={generating || (!selectedPositionId && !newPositionName.trim())} className="rounded-lg bg-orange px-4 py-2 text-white disabled:opacity-50">
              {t("generate")}
            </button>
          </form>
          {generatedCode ? (
            <p role="status" className="rounded-lg bg-green-50 p-3 text-sm">
              {t("generatedCode", { code: generatedCode })}
            </p>
          ) : null}

          <h3 className="mt-2 text-sm font-medium">{t("activeCodesTitle")}</h3>
          <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
            {accessCodes.map((code) => (
              <li key={code.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                <span className="font-mono">{code.code}</span>
                <span className="text-gray-600">{code.position.name}</span>
                <button type="button" onClick={() => void handleRevokeCode(code.id)} className="text-red-700">
                  {t("revoke")}
                </button>
              </li>
            ))}
            {accessCodes.length === 0 ? <li className="p-3 text-gray-600">{t("noActiveCodes")}</li> : null}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
