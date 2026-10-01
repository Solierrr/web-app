import { getAuthSession } from "@/shared/auth/authToken.utils";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import type { OperationalAccount, OperationalMembership, RegistrationDraft, RegistrationKind } from "./access.onboarding";

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function draftKey(kind: RegistrationKind): string {
  return `solaria.registration.${getAuthSession()?.userId ?? "visitor"}.${kind}`;
}

export function getRegistrationDraft(kind: RegistrationKind): RegistrationDraft {
  const fallback = { kind, step: 0, fields: {} };
  const visitor = readStored<RegistrationDraft>(`solaria.registration.visitor.${kind}`, fallback);
  const draft = readStored<RegistrationDraft>(draftKey(kind), visitor);
  if (getAuthSession() && draft === visitor) claimRegistrationDraft(draft);
  return draft;
}

export function saveRegistrationDraft(draft: RegistrationDraft): void {
  const privateFields = new Set(["password", "confirmPassword", "code", "token", "accessToken", "refreshToken"]);
  const fields = Object.fromEntries(Object.entries(draft.fields).filter(([key]) => !privateFields.has(key)));
  localStorage.setItem(draftKey(draft.kind), JSON.stringify({ ...draft, fields }));
}

export function claimRegistrationDraft(draft: RegistrationDraft): void {
  saveRegistrationDraft(draft);
  localStorage.removeItem(`solaria.registration.visitor.${draft.kind}`);
}

export function getSelectedContext(): string | null {
  return localStorage.getItem(`solaria.context.${getAuthSession()?.userId ?? "visitor"}`);
}

export function selectContext(context: string): void {
  localStorage.setItem(`solaria.context.${getAuthSession()?.userId ?? "visitor"}`, context);
  if (isAlwaysMockMode()) saveOperationalAccount({ ...getOperationalAccount(), selectedContext: context });
  else window.dispatchEvent(new Event("solaria:context"));
}

export function clearRegistrationDraft(kind: RegistrationKind): void {
  localStorage.removeItem(draftKey(kind));
}

export function getOperationalAccount(): OperationalAccount {
  const session = getAuthSession();
  if (!isAlwaysMockMode() || !session?.isMock) return { professional: false, memberships: [] };
  return readStored(`solaria.mock.account.${session.userId}`, { professional: false, memberships: [] });
}

export function saveOperationalAccount(account: OperationalAccount): void {
  const session = getAuthSession();
  if (!isAlwaysMockMode() || !session?.isMock) return;
  localStorage.setItem(`solaria.mock.account.${session.userId}`, JSON.stringify(account));
  window.dispatchEvent(new Event("solaria:context"));
}

export function addOperationalMembership(membership: OperationalMembership): void {
  const account = getOperationalAccount();
  saveOperationalAccount({ ...account, memberships: [...account.memberships.filter((item) => item.id !== membership.id), membership] });
}
