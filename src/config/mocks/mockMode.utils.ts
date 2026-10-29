import sleep from "@/lib/utils/sleep.utils";

import MocksMode from "./mocksMode.enum";

const DEFAULT_DELAY_SECONDS = 2;

function isFixtureEnvironment(): boolean {
  if (import.meta.env.PROD) return false;
  return import.meta.env.MODE === "test" || import.meta.env.DEV;
}

const OVERRIDES = {
  AUTH: () => import.meta.env.VITE_AUTH_MOCKS,
  MESSENGER: () => import.meta.env.VITE_MESSENGER_MOCKS,
  AI: () => import.meta.env.VITE_AI_MOCKS,
  NOTIFY: () => import.meta.env.VITE_NOTIFY_MOCKS,
};

export function isAlwaysMockMode(service?: keyof typeof OVERRIDES): boolean {
  const override = service ? OVERRIDES[service]() : undefined;
  const mode = override ?? import.meta.env.VITE_MOCKS;
  return isFixtureEnvironment() && mode === MocksMode.ALWAYS;
}

export function getMocksMode(): MocksMode {
  if (!isFixtureEnvironment()) return MocksMode.DEACTIVATED;

  const mode = import.meta.env.VITE_MOCKS as MocksMode;
  if (mode === MocksMode.ALWAYS || mode === MocksMode.FALLBACK || mode === MocksMode.DEACTIVATED) return mode;

  return MocksMode.DEACTIVATED;
}

export function getMockDelayMs(): number {
  const value = import.meta.env.VITE_MOCKS_DELAY_SECONDS;
  if (value === undefined || value.trim() === "") return DEFAULT_DELAY_SECONDS * 1000;

  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds < 0) return DEFAULT_DELAY_SECONDS * 1000;

  return seconds * 1000;
}

export async function waitForMockService(): Promise<void> {
  const delayMs = getMockDelayMs();
  if (delayMs === 0) return;

  await sleep(delayMs);
}
