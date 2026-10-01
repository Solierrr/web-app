import sleep from "@/utils/sleep.utils";

import MocksMode from "./mocksMode.enum";

const DEFAULT_DELAY_SECONDS = 2;

function isMockEnvironment(): boolean {
  return import.meta.env.DEV || import.meta.env.MODE === "test";
}

export function isAlwaysMockMode(): boolean {
  return isMockEnvironment() && import.meta.env.VITE_MOCKS === MocksMode.ALWAYS;
}

export function getMocksMode(): MocksMode {
  if (!isMockEnvironment()) return MocksMode.DEACTIVATED;

  const mode = import.meta.env.VITE_MOCKS as MocksMode;
  if (mode === MocksMode.ALWAYS || mode === MocksMode.DEACTIVATED) return mode;

  return MocksMode.FALLBACK;
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
