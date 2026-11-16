import type { AuthSession } from "@/features/access/access";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import { createMockSession } from "@/features/access/access.d.mocks";

/** Access tokens vivem somente em memória; o api-auth mantém o refresh em cookie HttpOnly. */
export class AuthSessionStore {
  private session: AuthSession | null = null;
  private generation = 0;
  private readonly mockKey = "solaria.mock.session";
  private readonly signedOutKey = "solaria.session.signedOut";

  get() {
    localStorage.removeItem("solaria.authSession");
    if (this.session?.isMock && !isAlwaysMockMode("AUTH")) this.session = null;
    if (this.session) return this.session;
    if (!isAlwaysMockMode("AUTH")) return null;
    try {
      const saved = JSON.parse(sessionStorage.getItem(this.mockKey) || "null");
      if (saved && typeof saved.email === "string" && typeof saved.userId === "string") {
        this.session = { ...createMockSession(saved.email, saved.userId), managedByCompany: saved.managedByCompany };
      }
    } catch { sessionStorage.removeItem(this.mockKey); }
    return this.session;
  }

  version() { return this.generation; }
  canRestore() { return sessionStorage.getItem(this.signedOutKey) !== "1"; }
  set(value: AuthSession) {
    this.generation++;
    const { refreshToken: discarded, ...session } = value;
    void discarded;
    this.session = session;
    sessionStorage.removeItem(this.signedOutKey);
    localStorage.removeItem("solaria.authSession");
    if (session.isMock && isAlwaysMockMode("AUTH")) sessionStorage.setItem(this.mockKey, JSON.stringify({ email: session.email, userId: session.userId, managedByCompany: session.managedByCompany }));
    else sessionStorage.removeItem(this.mockKey);
    window.dispatchEvent(new Event("solaria:session"));
  }
  clear(signedOut = false) {
    this.generation++;
    this.session = null;
    localStorage.removeItem("solaria.authSession");
    sessionStorage.removeItem(this.mockKey);
    if (signedOut) sessionStorage.setItem(this.signedOutKey, "1");
    window.dispatchEvent(new Event("solaria:session"));
  }
}

export const authSession = new AuthSessionStore();
