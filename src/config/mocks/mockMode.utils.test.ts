import { afterEach, expect, it, vi } from "vitest";
import { isAlwaysMockMode } from "./mockMode.utils";
afterEach(() => vi.unstubAllEnvs());
it("keeps API auth and messenger independent from general mocks", () => {
  vi.stubEnv("DEV", true);
  vi.stubEnv("VITE_MOCKS", "ALWAYS");
  vi.stubEnv("VITE_AUTH_MOCKS", "DEACTIVATED");
  vi.stubEnv("VITE_MESSENGER_MOCKS", "DEACTIVATED");
  expect(isAlwaysMockMode()).toBe(true);
  expect(isAlwaysMockMode("AUTH")).toBe(false);
  expect(isAlwaysMockMode("MESSENGER")).toBe(false);
});
it("never enables mocks in production", () => {
  vi.stubEnv("DEV", false);
  vi.stubEnv("MODE", "production");
  vi.stubEnv("VITE_MESSENGER_MOCKS", "ALWAYS");
  expect(isAlwaysMockMode("MESSENGER")).toBe(false);
});

it("uses seeded APIs in development even with legacy mock flags", () => {
  vi.stubEnv("MODE", "development");
  vi.stubEnv("DEV", true);
  vi.stubEnv("VITE_MOCKS", "ALWAYS");
  vi.stubEnv("VITE_AUTH_MOCKS", "ALWAYS");
  vi.stubEnv("VITE_MESSENGER_MOCKS", "ALWAYS");
  expect(isAlwaysMockMode()).toBe(false);
  expect(isAlwaysMockMode("AUTH")).toBe(false);
  expect(isAlwaysMockMode("MESSENGER")).toBe(true);
});
