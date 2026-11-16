import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthSessionStore } from "./authSession.service";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";

vi.mock("@/config/mocks/mockMode.utils", () => ({ isAlwaysMockMode: vi.fn().mockReturnValue(false) }));
const session = { accessToken: "private-access", refreshToken: "private-refresh", email: "test@test.dev", userId: "id", accessTokenExpiresAt: "2099-01-01T00:00:00Z" };
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); vi.mocked(isAlwaysMockMode).mockReturnValue(false); });
describe("AuthSessionStore", () => {
  it("keeps only access information in memory and removes legacy token storage", () => {
    localStorage.setItem("solaria.authSession", JSON.stringify(session));
    const store = new AuthSessionStore(); store.set(session);
    expect(store.get()?.accessToken).toBe("private-access");
    expect(store.get()?.refreshToken).toBeUndefined();
    expect(localStorage.getItem("solaria.authSession")).toBeNull();
    expect(sessionStorage.length).toBe(0);
    expect(new AuthSessionStore().get()).toBeNull();
  });
  it("restores mock identity without persisting even fake tokens", () => {
    vi.mocked(isAlwaysMockMode).mockReturnValue(true);
    new AuthSessionStore().set({ ...session, isMock: true });
    const raw = sessionStorage.getItem("solaria.mock.session")!;
    expect(raw).not.toContain("private-access"); expect(raw).not.toContain("private-refresh");
    expect(new AuthSessionStore().get()?.email).toBe(session.email);
  });
  it("logout invalidates pending changes and removes mock persistence", () => {
    const store = new AuthSessionStore(); store.set(session); const version = store.version(); store.clear();
    expect(store.version()).toBeGreaterThan(version); expect(store.get()).toBeNull();
  });
  it("does not restore a cookie after explicit logout even if the server was offline", () => {
    const store = new AuthSessionStore(); store.set(session); store.clear(true);
    expect(new AuthSessionStore().canRestore()).toBe(false);
    store.set(session); expect(store.canRestore()).toBe(true);
  });
});
