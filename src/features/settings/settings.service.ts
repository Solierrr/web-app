import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import type { DeviceSession, PrivacyPreferences } from "./settings";

const DEFAULT_PRIVACY: PrivacyPreferences = { showContact: true, showInSearch: true };
const MOCK_SESSIONS: DeviceSession[] = [
  { id: "mock-phone", device: "Android · Chrome", lastActive: "2026-09-28T18:20:00Z", current: false },
  { id: "mock-laptop", device: "Windows · Edge", lastActive: "2026-09-25T09:05:00Z", current: false },
];

function privacyKey(): string {
  return `solaria.privacy.${getAuthSession()?.userId ?? "anonymous"}`;
}

export function getPrivacyPreferences(): PrivacyPreferences {
  try {
    const stored = JSON.parse(localStorage.getItem(privacyKey()) ?? "null") as Partial<PrivacyPreferences> | null;
    return { ...DEFAULT_PRIVACY, ...stored };
  } catch {
    return DEFAULT_PRIVACY;
  }
}

export function savePrivacyPreferences(preferences: PrivacyPreferences): void {
  localStorage.setItem(privacyKey(), JSON.stringify(preferences));
}

export async function listSessions(): Promise<DeviceSession[]> {
  const current: DeviceSession = { id: "current", device: navigator.userAgent, lastActive: new Date().toISOString(), current: true };
  if (!isAlwaysMockMode()) return [current];
  await waitForMockService();
  return [current, ...MOCK_SESSIONS];
}

export async function revokeSession(id: string): Promise<void> {
  if (isAlwaysMockMode()) await waitForMockService();
  else throw new Error(`Encerrar a sessão ${id} ainda não é suportado pelo servidor`);
}
