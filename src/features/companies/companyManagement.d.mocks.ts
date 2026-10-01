import { getOperationalAccount, addOperationalMembership } from "@/features/access/onboarding.service";
import type { AccessCode, Employee, Position, RedeemedMembership } from "./companyManagement.service";

interface MockAccessCode extends AccessCode {
  companyName: string;
  companyType: "SUPPLIER" | "DEMANDANT";
}

interface MockInvitations {
  positions: Position[];
  codes: MockAccessCode[];
}

const STORAGE_KEY = "solaria.mock.invitations";

export function getMockEmployees(companyId: string): Employee[] {
  const key = `solaria.mock.employees.${companyId}`;
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch {
    return [];
  }
  return [
    { id: `${companyId}:admin`, companyId, userId: "mock-admin", position: { id: "mock-admin", name: "ADMIN", accesses: "" } },
    { id: `${companyId}:member`, companyId, userId: "mock-member", position: { id: "mock-member", name: "MEMBER", accesses: "" } },
  ];
}

export function saveMockEmployees(companyId: string, employees: Employee[]): void {
  localStorage.setItem(`solaria.mock.employees.${companyId}`, JSON.stringify(employees));
}

export function getMockInvitations(): MockInvitations {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") ?? { positions: [{ id: "mock-member", name: "MEMBER", accesses: "" }], codes: [] };
  } catch {
    return { positions: [], codes: [] };
  }
}

export function saveMockInvitations(state: MockInvitations): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createMockAccessCode(companyId: string, positionId: string): AccessCode {
  const state = getMockInvitations();
  const company = getOperationalAccount().memberships.find((item) => item.id === companyId);
  const code: MockAccessCode = {
    id: crypto.randomUUID(),
    companyId,
    code: crypto.randomUUID().slice(0, 8).toUpperCase(),
    status: "ACTIVE",
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    companyName: company?.name ?? "Empresa do convite",
    companyType: company?.type ?? "SUPPLIER",
    position: state.positions.find((position) => position.id === positionId) ?? { id: positionId, name: "MEMBER", accesses: "" },
  };
  saveMockInvitations({ ...state, codes: [...state.codes, code] });
  return code;
}

export function redeemMockAccessCode(value: string): RedeemedMembership {
  const state = getMockInvitations();
  const code = state.codes.find((item) => item.code.toUpperCase() === value.trim().toUpperCase());
  const companyId = code?.companyId ?? "mock-invitation-company";
  const position = code?.position ?? { id: "mock-member", name: "MEMBER", accesses: "" };
  addOperationalMembership({
    id: companyId,
    name: code?.companyName ?? "Empresa do convite",
    type: code?.companyType ?? "SUPPLIER",
    admin: position.name === "ADMIN",
  });
  if (code) saveMockInvitations({ ...state, codes: state.codes.map((item) => (item.id === code.id ? { ...item, status: "USED" } : item)) });
  return { companyId, position };
}
