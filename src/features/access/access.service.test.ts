import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { login, refresh } from "./access.service";
import type { AuthSession } from "./access";
import { httpJson } from "@/lib/shared/http/http.service";
import { clearAuthSession, getAuthSession, setAuthSession } from "@/lib/shared/auth/authToken.utils";

vi.mock("@/lib/shared/http/http.service", () => ({ httpJson: vi.fn() }));

const stored: AuthSession = {
  accessToken: "old-access", refreshToken: "old-refresh", userId: "user-1",
  email: "user@example.test", accessTokenExpiresAt: "2026-01-01T00:00:00Z",
};
const renewed = { ...stored, accessToken: "new-access", refreshToken: "new-refresh" };

describe("session renewal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_AUTH_MOCKS", "DEACTIVATED");
    const values = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
      removeItem: (key: string) => { values.delete(key); },
    });
    clearAuthSession();
    setAuthSession(stored);
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  it("restores after a reload using only the browser cookie", async () => {
    clearAuthSession();
    const { refreshToken: unused, ...cookieSession } = renewed; void unused;
    vi.mocked(httpJson).mockResolvedValueOnce(cookieSession);
    expect(await refresh()).toEqual(cookieSession);
    expect(getAuthSession()?.accessToken).toBe("new-access");
    expect(httpJson).toHaveBeenCalledWith(expect.stringContaining("/auth/browser/refresh"), expect.objectContaining({ credentials: "include", body: {}, headers: { "X-Solaria-Session": "1" } }));
  });

  it("shares one rotating-token request between simultaneous callers", async () => {
    let complete!: (session: AuthSession) => void;
    vi.mocked(httpJson).mockImplementationOnce(() => new Promise<AuthSession>((resolve) => { complete = resolve; }));
    const first = refresh();
    const second = refresh();
    expect(httpJson).toHaveBeenCalledTimes(1);
    complete(renewed);
    expect(await first).toEqual(renewed);
    expect(await second).toEqual(renewed);
    expect(getAuthSession()?.refreshToken).toBeUndefined();
    expect(localStorage.getItem("solaria.authSession")).toBeNull();
  });

  it("does not restore a session after logout while renewal is in flight", async () => {
    let complete!: (session: AuthSession) => void;
    vi.mocked(httpJson).mockImplementationOnce(() => new Promise<AuthSession>((resolve) => { complete = resolve; }));
    const pending = refresh();
    clearAuthSession();
    complete(renewed);
    expect(await pending).toBeNull();
    expect(getAuthSession()).toBeNull();
  });
  it("does not apply a late login response after explicit logout", async () => {
    let complete!: (session: AuthSession) => void;
    vi.mocked(httpJson).mockImplementationOnce(() => new Promise<AuthSession>(resolve => { complete = resolve; }));
    const pending = login({ email: stored.email, password: "password" });
    clearAuthSession(true); complete(renewed);
    await expect(pending).rejects.toThrow();
    expect(getAuthSession()).toBeNull();
  });

  it("permits another attempt after a failed renewal", async () => {
    vi.mocked(httpJson).mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(renewed);
    await expect(refresh()).rejects.toThrow("offline");
    await expect(refresh()).resolves.toEqual(renewed);
    expect(httpJson).toHaveBeenCalledTimes(2);
  });
});
