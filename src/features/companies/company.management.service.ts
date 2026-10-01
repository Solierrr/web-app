import { httpJson } from "@/lib/shared/http/http.service";
import { API_CORE_URL } from "@/lib/shared/http/apiCore.utils";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import {
  createMockAccessCode,
  getMockEmployees,
  saveMockEmployees,
  getMockInvitations,
  redeemMockAccessCode,
  saveMockInvitations,
} from "./company.management.d.mocks";
import { getSelectedContext } from "@/features/access/access.onboarding.service";
import { permissionMocks, getMockPositionPermissions, saveMockPositionPermissions } from "@/features/permissions/permissions.d.mocks";

const SERVICE_NAME = "companyManagement";

export interface Position {
  id: string;
  name: string;
  accesses: string;
}

export interface Permission {
  id: string;
  permissionName: string;
  name: string;
  description: string;
}

export interface PositionPermission {
  id: string;
  positionId: string;
  permission: Permission;
}

export interface Employee {
  id: string;
  companyId: string;
  userId: string;
  position: Position;
}

export interface AccessCode {
  id: string;
  companyId: string;
  code: string;
  status: "ACTIVE" | "USED" | "REVOKED";
  expiresAt: string;
  position: Position;
}

// Cargos (positions)

export function listPositions(): Promise<Position[]> {
  return httpJson<Position[]>(`${API_CORE_URL}/positions`, {
    service: SERVICE_NAME,
    operation: "listPositions",
    errorMessage: "Não foi possível carregar os cargos",
  });
}

export async function createPosition(name: string): Promise<Position> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    const state = getMockInvitations();
    const position = { id: crypto.randomUUID(), name, accesses: "" };
    saveMockInvitations({ ...state, positions: [...state.positions, position] });
    return position;
  }
  return httpJson<Position>(`${API_CORE_URL}/positions`, {
    service: SERVICE_NAME,
    operation: "createPosition",
    method: "POST",
    body: { name, accesses: "" },
    errorMessage: "Não foi possível criar o cargo",
  });
}

export async function listCompanyPositions(companyId: string): Promise<{ id: string; companyId: string; position: Position }[]> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return getMockInvitations().positions.map((position) => ({ id: position.id, companyId, position }));
  }
  return httpJson(`${API_CORE_URL}/company-positions/company/${encodeURIComponent(companyId)}`, {
    service: SERVICE_NAME,
    operation: "listCompanyPositions",
    errorMessage: "Não foi possível carregar os cargos da empresa",
  });
}

export async function linkPositionToCompany(companyId: string, positionId: string): Promise<{ id: string }> {
  if (isAlwaysMockMode()) return { id: `${companyId}:${positionId}` };
  return httpJson<{ id: string }>(`${API_CORE_URL}/company-positions`, {
    service: SERVICE_NAME,
    operation: "linkPositionToCompany",
    method: "POST",
    body: { companyId, positionId },
    errorMessage: "Não foi possível disponibilizar o cargo para a empresa",
  });
}

// Permissões

export async function listPermissions(): Promise<Permission[]> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return permissionMocks;
  }
  return httpJson<Permission[]>(`${API_CORE_URL}/permissions`, {
    service: SERVICE_NAME,
    operation: "listPermissions",
    errorMessage: "Não foi possível carregar as permissões",
  });
}

export async function listPositionPermissions(positionId: string): Promise<PositionPermission[]> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return getMockPositionPermissions().filter((item) => item.positionId === positionId);
  }
  return httpJson<PositionPermission[]>(`${API_CORE_URL}/position-permissions/position/${encodeURIComponent(positionId)}`, {
    service: SERVICE_NAME,
    operation: "listPositionPermissions",
    errorMessage: "Não foi possível carregar as permissões do cargo",
  });
}

export async function grantPermission(positionId: string, permissionId: string): Promise<PositionPermission> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    const items = getMockPositionPermissions();
    const existing = items.find((item) => item.positionId === positionId && item.permission.id === permissionId);
    if (existing) return existing;
    const permission = permissionMocks.find((item) => item.id === permissionId) ?? {
      id: permissionId,
      permissionName: permissionId,
      name: permissionId,
      description: permissionId,
    };
    const item = { id: crypto.randomUUID(), positionId, permission };
    saveMockPositionPermissions([...items, item]);
    return item;
  }
  return httpJson<PositionPermission>(`${API_CORE_URL}/position-permissions`, {
    service: SERVICE_NAME,
    operation: "grantPermission",
    method: "POST",
    body: { positionId, permissionId },
    errorMessage: "Não foi possível conceder a permissão",
  });
}

export async function revokePermission(id: string): Promise<void> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    saveMockPositionPermissions(getMockPositionPermissions().filter((item) => item.id !== id));
    return;
  }
  return httpJson<void>(`${API_CORE_URL}/position-permissions/${encodeURIComponent(id)}`, {
    service: SERVICE_NAME,
    operation: "revokePermission",
    method: "DELETE",
    errorMessage: "Não foi possível revogar a permissão",
  });
}

// Funcionários

export async function listEmployees(companyId: string): Promise<Employee[]> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return getMockEmployees(companyId);
  }
  return httpJson<Employee[]>(`${API_CORE_URL}/user-companies/company/${encodeURIComponent(companyId)}`, {
    service: SERVICE_NAME,
    operation: "listEmployees",
    errorMessage: "Não foi possível carregar os funcionários",
  });
}

export async function updateEmployeePosition(userCompanyId: string, positionId: string): Promise<Employee> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    const companyId = getSelectedContext() ?? "mock-company";
    const employees = getMockEmployees(companyId);
    const position = getMockInvitations().positions.find((item) => item.id === positionId) ?? { id: positionId, name: "MEMBER", accesses: "" };
    const updated = { ...(employees.find((item) => item.id === userCompanyId) ?? { id: userCompanyId, companyId, userId: "mock-member" }), position };
    saveMockEmployees(companyId, [...employees.filter((item) => item.id !== userCompanyId), updated]);
    return updated;
  }
  return httpJson<Employee>(`${API_CORE_URL}/user-companies/${encodeURIComponent(userCompanyId)}/position`, {
    service: SERVICE_NAME,
    operation: "updateEmployeePosition",
    method: "PATCH",
    body: { positionId },
    errorMessage: "Não foi possível atualizar o cargo do funcionário",
  });
}

export async function removeEmployee(userCompanyId: string): Promise<void> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    const companyId = getSelectedContext() ?? "mock-company";
    saveMockEmployees(
      companyId,
      getMockEmployees(companyId).filter((item) => item.id !== userCompanyId),
    );
    return;
  }
  return httpJson<void>(`${API_CORE_URL}/user-companies/${encodeURIComponent(userCompanyId)}`, {
    service: SERVICE_NAME,
    operation: "removeEmployee",
    method: "DELETE",
    errorMessage: "Não foi possível desligar o funcionário",
  });
}

// Códigos de acesso

export async function generateAccessCode(companyId: string, positionId: string): Promise<AccessCode> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return createMockAccessCode(companyId, positionId);
  }
  return httpJson<AccessCode>(`${API_CORE_URL}/access-codes`, {
    service: SERVICE_NAME,
    operation: "generateAccessCode",
    method: "POST",
    body: { companyId, positionId },
    errorMessage: "Não foi possível gerar o código de acesso",
  });
}

export async function listAccessCodes(companyId: string): Promise<AccessCode[]> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return getMockInvitations().codes.filter((code) => code.companyId === companyId);
  }
  return httpJson<AccessCode[]>(`${API_CORE_URL}/access-codes/company/${encodeURIComponent(companyId)}`, {
    service: SERVICE_NAME,
    operation: "listAccessCodes",
    errorMessage: "Não foi possível carregar os códigos de acesso",
  });
}

export async function revokeAccessCode(id: string, companyId: string): Promise<void> {
  if (isAlwaysMockMode()) {
    const state = getMockInvitations();
    saveMockInvitations({
      ...state,
      codes: state.codes.map((code) => (code.id === id && code.companyId === companyId ? { ...code, status: "REVOKED" } : code)),
    });
    return;
  }
  return httpJson<void>(`${API_CORE_URL}/access-codes/${encodeURIComponent(id)}/company/${encodeURIComponent(companyId)}`, {
    service: SERVICE_NAME,
    operation: "revokeAccessCode",
    method: "DELETE",
    errorMessage: "Não foi possível revogar o código de acesso",
  });
}

export interface RedeemedMembership {
  companyId: string;
  position: Position;
}

export async function redeemAccessCode(code: string): Promise<RedeemedMembership> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return redeemMockAccessCode(code);
  }
  return httpJson<RedeemedMembership>(`${API_CORE_URL}/access-codes/redeem`, {
    service: SERVICE_NAME,
    operation: "redeemAccessCode",
    method: "POST",
    body: { code },
    errorMessage: "Não foi possível usar o código de acesso",
  });
}
