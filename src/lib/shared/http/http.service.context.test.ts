import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const context = vi.hoisted(() => ({ selected: vi.fn() }));
vi.mock("@/features/access/access.onboarding.service", () => ({ getSelectedContext: context.selected }));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => ({ accessToken: "test-token" }) }));
vi.mock("@/config/logging/logger", () => ({ default: { serviceError: vi.fn() } }));
import { httpJson } from "./http.service";
const company = "f5218a7e-cbf4-4b94-b215-564becf56aa7";
describe("company context headers", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_API_CORE", "/local-api/core");
    context.selected.mockReturnValue(company);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { headers: { "Content-Type": "application/json" } })));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });
  async function request(url = "/local-api/core/api/projects", authenticated = true) {
    await httpJson(url, { authenticated, service: "test", operation: "list", errorMessage: "Failed" });
    return vi.mocked(fetch).mock.calls[0][1]?.headers as Record<string, string>;
  }
  it("sends the selected company only to the Core API", async () => {
    expect((await request())["X-Company-Id"]).toBe(company);
  });
  it("does not send company context to authentication", async () => {
    expect((await request("/local-api/auth/auth/login"))["X-Company-Id"]).toBeUndefined();
  });
  it("does not send a personal or malformed context", async () => {
    context.selected.mockReturnValue("personal");
    expect((await request())["X-Company-Id"]).toBeUndefined();
  });
  it("does not send company context for unauthenticated requests", async () => {
    expect((await request(undefined, false))["X-Company-Id"]).toBeUndefined();
  });
});
