import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { refresh } from "./access.service";
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
    const values = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
      removeItem: (key: string) => { values.delete(key); },
    });
    clearAuthSession();
    setAuthSession(stored);
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("shares one rotating-token request between simultaneous callers", async () => {
    let complete!: (session: AuthSession) => void;
    vi.mocked(httpJson).mockImplementationOnce(() => new Promise<AuthSession>((resolve) => { complete = resolve; }));
    const first = refresh();
    const second = refresh();
    expect(httpJson).toHaveBeenCalledTimes(1);
    complete(renewed);
    expect(await first).toEqual(renewed);
    expect(await second).toEqual(renewed);
    expect(getAuthSession()?.refreshToken).toBe("new-refresh");
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

  it("permits another attempt after a failed renewal", async () => {
    vi.mocked(httpJson).mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(renewed);
    await expect(refresh()).rejects.toThrow("offline");
    await expect(refresh()).resolves.toEqual(renewed);
    expect(httpJson).toHaveBeenCalledTimes(2);
  });
});
