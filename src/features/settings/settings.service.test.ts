import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPrivacyPreferences, listSessions, revokeSession, savePrivacyPreferences } from "./settings.service";
import { clearAuthSession, setAuthSession } from "@/lib/shared/auth/authToken.utils";

describe("settings.service", () => {
  beforeEach(() => {
    localStorage.clear();
    clearAuthSession();
    vi.stubEnv("VITE_MOCKS", "DEACTIVATED");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults every privacy preference to visible", () => {
    expect(getPrivacyPreferences()).toEqual({ showContact: true, showInSearch: true });
  });

  it("persists and reads back the privacy preferences", () => {
    savePrivacyPreferences({ showContact: false, showInSearch: true });

    expect(getPrivacyPreferences()).toEqual({ showContact: false, showInSearch: true });
  });

  it("keeps the preferences of each user apart", () => {
    setAuthSession({ userId: "user-1", email: "user@test.dev", accessToken: "access", accessTokenExpiresAt: "2099-01-01T00:00:00Z" });
    savePrivacyPreferences({ showContact: false, showInSearch: false });
    setAuthSession({ userId: "user-2", email: "other@test.dev", accessToken: "access", accessTokenExpiresAt: "2099-01-01T00:00:00Z" });

    expect(getPrivacyPreferences()).toEqual({ showContact: true, showInSearch: true });
  });

  it("lists only the current device when the server has no sessions endpoint", async () => {
    const sessions = await listSessions();

    expect(sessions).toHaveLength(1);
    expect(sessions[0].current).toBe(true);
  });

  it("refuses to end another session until the server supports it", async () => {
    await expect(revokeSession("other")).rejects.toThrow();
  });

  it("lists mocked extra devices and ends them in mock mode", async () => {
    vi.stubEnv("VITE_MOCKS", "ALWAYS");
    vi.stubEnv("VITE_MOCKS_DELAY_SECONDS", "0");

    expect((await listSessions()).length).toBeGreaterThan(1);
    await expect(revokeSession("mock-phone")).resolves.toBeUndefined();
  });
});
