import { httpJson } from "@/shared/http/http.service";
import { API_CORE_URL } from "@/shared/http/apiCore.utils";

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

export function createPosition(name: string): Promise<Position> {
  return httpJson<Position>(`${API_CORE_URL}/positions`, {
    service: SERVICE_NAME,
    operation: "createPosition",
    method: "POST",
    body: { name, accesses: "" },
    errorMessage: "Não foi possível criar o cargo",
  });
}

export function listCompanyPositions(companyId: string): Promise<{ id: string; companyId: string; position: Position }[]> {
  return httpJson(`${API_CORE_URL}/company-positions/company/${encodeURIComponent(companyId)}`, {
    service: SERVICE_NAME,
    operation: "listCompanyPositions",
    errorMessage: "Não foi possível carregar os cargos da empresa",
  });
}

export function linkPositionToCompany(companyId: string, positionId: string): Promise<{ id: string }> {
  return httpJson<{ id: string }>(`${API_CORE_URL}/company-positions`, {
    service: SERVICE_NAME,
    operation: "linkPositionToCompany",
    method: "POST",
    body: { companyId, positionId },
    errorMessage: "Não foi possível disponibilizar o cargo para a empresa",
  });
}

// Permissões

export function listPermissions(): Promise<Permission[]> {
  return httpJson<Permission[]>(`${API_CORE_URL}/permissions`, {
    service: SERVICE_NAME,
    operation: "listPermissions",
    errorMessage: "Não foi possível carregar as permissões",
  });
}

export function listPositionPermissions(positionId: string): Promise<PositionPermission[]> {
  return httpJson<PositionPermission[]>(`${API_CORE_URL}/position-permissions/position/${encodeURIComponent(positionId)}`, {
    service: SERVICE_NAME,
    operation: "listPositionPermissions",
    errorMessage: "Não foi possível carregar as permissões do cargo",
  });
}

export function grantPermission(positionId: string, permissionId: string): Promise<PositionPermission> {
  return httpJson<PositionPermission>(`${API_CORE_URL}/position-permissions`, {
    service: SERVICE_NAME,
    operation: "grantPermission",
    method: "POST",
    body: { positionId, permissionId },
    errorMessage: "Não foi possível conceder a permissão",
  });
}

export function revokePermission(id: string): Promise<void> {
  return httpJson<void>(`${API_CORE_URL}/position-permissions/${encodeURIComponent(id)}`, {
    service: SERVICE_NAME,
    operation: "revokePermission",
    method: "DELETE",
    errorMessage: "Não foi possível revogar a permissão",
  });
}

// Funcionários

export function listEmployees(companyId: string): Promise<Employee[]> {
  return httpJson<Employee[]>(`${API_CORE_URL}/user-companies/company/${encodeURIComponent(companyId)}`, {
    service: SERVICE_NAME,
    operation: "listEmployees",
    errorMessage: "Não foi possível carregar os funcionários",
  });
}

export function updateEmployeePosition(userCompanyId: string, positionId: string): Promise<Employee> {
  return httpJson<Employee>(`${API_CORE_URL}/user-companies/${encodeURIComponent(userCompanyId)}/position`, {
    service: SERVICE_NAME,
    operation: "updateEmployeePosition",
    method: "PATCH",
    body: { positionId },
    errorMessage: "Não foi possível atualizar o cargo do funcionário",
  });
}

export function removeEmployee(userCompanyId: string): Promise<void> {
  return httpJson<void>(`${API_CORE_URL}/user-companies/${encodeURIComponent(userCompanyId)}`, {
    service: SERVICE_NAME,
    operation: "removeEmployee",
    method: "DELETE",
    errorMessage: "Não foi possível desligar o funcionário",
  });
}

// Códigos de acesso

export function generateAccessCode(companyId: string, positionId: string): Promise<AccessCode> {
  return httpJson<AccessCode>(`${API_CORE_URL}/access-codes`, {
    service: SERVICE_NAME,
    operation: "generateAccessCode",
    method: "POST",
    body: { companyId, positionId },
    errorMessage: "Não foi possível gerar o código de acesso",
  });
}

export function listAccessCodes(companyId: string): Promise<AccessCode[]> {
  return httpJson<AccessCode[]>(`${API_CORE_URL}/access-codes/company/${encodeURIComponent(companyId)}`, {
    service: SERVICE_NAME,
    operation: "listAccessCodes",
    errorMessage: "Não foi possível carregar os códigos de acesso",
  });
}

export function revokeAccessCode(id: string, companyId: string): Promise<void> {
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

export function redeemAccessCode(code: string): Promise<RedeemedMembership> {
  return httpJson<RedeemedMembership>(`${API_CORE_URL}/access-codes/redeem`, {
    service: SERVICE_NAME,
    operation: "redeemAccessCode",
    method: "POST",
    body: { code },
    errorMessage: "Não foi possível usar o código de acesso",
  });
}
