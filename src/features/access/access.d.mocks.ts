import type { AuthSession } from "./access";
import type { OperationalAccount } from "./access.onboarding";

export const MOCK_TEST_USER_ID = "mock:solaria-test";
export const MOCK_TEST_EMAIL = "teste@solaria.example";

export function createMockTestAccount(): OperationalAccount {
  return {
    professional: true,
    professionalProfile: {
      name: "Teste Solaria",
      email: MOCK_TEST_EMAIL,
      phone: "31999990000",
      crea: "TESTE-001",
      profession: "Engenharia",
      council: "CREA",
      registrationNumber: "TESTE-001",
      expirationDate: "2099-12-31",
    },
    selectedContext: "mock-test-supplier",
    memberships: [
      { id: "mock-test-supplier", name: "Fornecedor de teste", type: "SUPPLIER", admin: true },
      { id: "mock-test-demandant", name: "Demandante de teste", type: "DEMANDANT", admin: true },
    ],
  };
}

export function isMockTestSession(session: AuthSession | null): boolean {
  return session?.isMock === true && session.userId === MOCK_TEST_USER_ID;
}

export function createMockSession(email: string, userId = `mock:${email.trim().toLowerCase()}`): AuthSession {
  return {
    userId,
    email: email.trim().toLowerCase(),
    accessToken: `mock-access-${crypto.randomUUID()}`,
    refreshToken: `mock-refresh-${crypto.randomUUID()}`,
    accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
    isMock: true,
  };
}
