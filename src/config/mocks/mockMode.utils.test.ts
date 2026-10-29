import { afterEach, expect, it, vi } from "vitest";
import { getMocksMode, isAlwaysMockMode } from "./mockMode.utils";
import MocksMode from "./mocksMode.enum";
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

it("never enables mocks in a production build, whatever the build mode or the flags are", () => {
  vi.stubEnv("PROD", true);
  vi.stubEnv("DEV", false);
  vi.stubEnv("MODE", "test");
  vi.stubEnv("VITE_MOCKS", "ALWAYS");
  vi.stubEnv("VITE_AUTH_MOCKS", "ALWAYS");
  vi.stubEnv("VITE_MESSENGER_MOCKS", "ALWAYS");
  expect(isAlwaysMockMode()).toBe(false);
  expect(isAlwaysMockMode("AUTH")).toBe(false);
  expect(isAlwaysMockMode("MESSENGER")).toBe(false);
  expect(getMocksMode()).toBe(MocksMode.DEACTIVATED);
});

it("uses mocks in development only when they are explicitly enabled", () => {
  vi.stubEnv("MODE", "development");
  vi.stubEnv("DEV", true);
  vi.stubEnv("VITE_MOCKS", "DEACTIVATED");
  vi.stubEnv("VITE_AUTH_MOCKS", "DEACTIVATED");
  vi.stubEnv("VITE_MESSENGER_MOCKS", "ALWAYS");
  expect(isAlwaysMockMode()).toBe(false);
  expect(isAlwaysMockMode("AUTH")).toBe(false);
  expect(isAlwaysMockMode("MESSENGER")).toBe(true);
  expect(getMocksMode()).toBe(MocksMode.DEACTIVATED);
});

it("treats a missing or unknown mock flag as disabled", () => {
  vi.stubEnv("DEV", true);
  vi.stubEnv("VITE_MOCKS", "");
  expect(getMocksMode()).toBe(MocksMode.DEACTIVATED);
  expect(isAlwaysMockMode()).toBe(false);
  vi.stubEnv("VITE_MOCKS", "SOMETIMES");
  expect(getMocksMode()).toBe(MocksMode.DEACTIVATED);
});

it("keeps the AI services independent from general mocks", () => {
  vi.stubEnv("DEV", true);
  vi.stubEnv("VITE_MOCKS", "DEACTIVATED");
  vi.stubEnv("VITE_AI_MOCKS", "ALWAYS");
  expect(isAlwaysMockMode("AI")).toBe(true);
  expect(isAlwaysMockMode()).toBe(false);
  vi.stubEnv("PROD", true);
  expect(isAlwaysMockMode("AI")).toBe(false);
});

it("keeps the notifications mock independent and overridable from the general flag", () => {
  vi.stubEnv("DEV", true);
  vi.stubEnv("VITE_MOCKS", "ALWAYS");
  vi.stubEnv("VITE_NOTIFY_MOCKS", "DEACTIVATED");
  expect(isAlwaysMockMode("NOTIFY")).toBe(false);
  vi.stubEnv("VITE_MOCKS", "DEACTIVATED");
  vi.stubEnv("VITE_NOTIFY_MOCKS", "ALWAYS");
  expect(isAlwaysMockMode("NOTIFY")).toBe(true);
  vi.stubEnv("PROD", true);
  expect(isAlwaysMockMode("NOTIFY")).toBe(false);
});
