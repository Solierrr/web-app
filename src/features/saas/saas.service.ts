import type { OperationalContext } from "./saas";

import { resolveWithMocks } from "@/config/mocks/fallback.service";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import { getMocksMode } from "@/config/mocks/mockMode.utils";
import MocksMode from "@/config/mocks/mocksMode.enum";
import { API_CORE_URL } from "@/shared/http/apiCore.utils";
import { httpJson } from "@/shared/http/http.service";
import { getAuthSession } from "@/shared/auth/authToken.utils";

const SERVICE_NAME = "saas";
const MOCK_CONTEXT_KEY_PREFIX = "solaria.mockOperationalContext.";

const mockOperationalContext: OperationalContext = {
  companyId: "mock-company",
  companyType: "SUPPLIER",
  companyStatus: "APPROVED",
  positionName: "ADMIN",
  admin: true,
  permissions: [],
};

function getMockContextForSession(): OperationalContext | null {
  const session = getAuthSession();
  if (!session) return mockOperationalContext;

  const storedContext = localStorage.getItem(`${MOCK_CONTEXT_KEY_PREFIX}${session.userId}`);
  if (storedContext === "null") return null;
  return storedContext ? (JSON.parse(storedContext) as OperationalContext) : mockOperationalContext;
}

function getStoredContext(sessionId: string): OperationalContext | null | undefined {
  const storedContext = localStorage.getItem(`${MOCK_CONTEXT_KEY_PREFIX}${sessionId}`);
  if (storedContext === null) return undefined;
  return storedContext === "null" ? null : (JSON.parse(storedContext) as OperationalContext);
}

export function getOperationalContext(): Promise<OperationalContext | null> {
  const session = getAuthSession();
  if (session && getMocksMode() === MocksMode.FALLBACK) {
    const storedContext = getStoredContext(session.userId);
    if (storedContext !== undefined) return Promise.resolve(storedContext);
  }
  if (session?.isMock && !isAlwaysMockMode()) {
    return Promise.resolve(getMockContextForSession());
  }

  return resolveWithMocks(
    () =>
      httpJson<OperationalContext | null>(`${API_CORE_URL}/user-companies/me`, {
        service: SERVICE_NAME,
        operation: "getOperationalContext",
        errorMessage: "Não foi possível obter o perfil operacional",
      }),
    getMockContextForSession,
  );
}

export function setMockOperationalContext(companyType: OperationalContext["companyType"], companyId: string): void {
  const session = getAuthSession();
  if (!session) return;

  localStorage.setItem(
    `${MOCK_CONTEXT_KEY_PREFIX}${session.userId}`,
    JSON.stringify({ ...mockOperationalContext, companyId, companyType }),
  );
}

export function setMockProfessionalContext(): void {
  const session = getAuthSession();
  if (!session) return;

  localStorage.setItem(`${MOCK_CONTEXT_KEY_PREFIX}${session.userId}`, "null");
}
