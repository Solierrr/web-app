import { afterEach, expect, it, vi } from "vitest";
import { getAuthSession } from "./authToken.utils";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
it("rejects old mock sessions in development without clearing stored data", () => {
  vi.stubEnv("MODE", "development");
  vi.stubEnv("VITE_AUTH_MOCKS", "ALWAYS");
  const removeItem = vi.fn();
  vi.stubGlobal("localStorage", { getItem: () => JSON.stringify({ isMock: true, userId: "mock" }), removeItem });
  expect(getAuthSession()).toBeNull();
  expect(removeItem).not.toHaveBeenCalled();
});
it("keeps real API sessions", () => {
  vi.stubEnv("MODE", "development");
  const session = { userId: "seed-user", accessToken: "api-token" };
  vi.stubGlobal("localStorage", { getItem: () => JSON.stringify(session) });
  expect(getAuthSession()).toEqual(session);
});
