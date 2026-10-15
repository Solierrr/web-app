import { afterEach, describe, expect, it, vi } from "vitest";

import MocksMode from "@/config/mocks/mocksMode.enum";

import { resolveWithMocks } from "./fallback.service";

const NAP_TIME_MS = 2000;

describe("resolveWithMocks", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("waits before returning the mock when mode is ALWAYS", async () => {
    vi.useFakeTimers();
    vi.stubEnv("VITE_MOCKS", MocksMode.ALWAYS);
    const apiCall = vi.fn();
    const mockCall = vi.fn().mockReturnValue("mock");

    const resultPromise = resolveWithMocks(apiCall, mockCall);
    await vi.advanceTimersByTimeAsync(NAP_TIME_MS - 1);

    expect(mockCall).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);

    await expect(resultPromise).resolves.toBe("mock");
    expect(apiCall).not.toHaveBeenCalled();
  });

  it("calls only the API and propagates errors when mode is DEACTIVATED", async () => {
    vi.stubEnv("VITE_MOCKS", MocksMode.DEACTIVATED);
    const apiCall = vi.fn().mockRejectedValue(new Error("boom"));
    const mockCall = vi.fn();

    await expect(resolveWithMocks(apiCall, mockCall)).rejects.toThrow("boom");
    expect(mockCall).not.toHaveBeenCalled();
  });

  it("returns the API result when mode is FALLBACK and the API succeeds", async () => {
    vi.stubEnv("VITE_MOCKS", MocksMode.FALLBACK);
    const apiCall = vi.fn().mockResolvedValue("api");
    const mockCall = vi.fn();

    const result = await resolveWithMocks(apiCall, mockCall);

    expect(result).toBe("api");
    expect(mockCall).not.toHaveBeenCalled();
  });

  it("waits before falling back to the mock when the API fails", async () => {
    vi.useFakeTimers();
    vi.stubEnv("VITE_MOCKS", MocksMode.FALLBACK);
    const apiCall = vi.fn().mockRejectedValue(new Error("boom"));
    const mockCall = vi.fn().mockReturnValue("mock");

    const resultPromise = resolveWithMocks(apiCall, mockCall);
    await vi.advanceTimersByTimeAsync(NAP_TIME_MS - 1);

    expect(mockCall).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);

    await expect(resultPromise).resolves.toBe("mock");
  });

  it("propagates API failures when VITE_MOCKS is unset or invalid", async () => {
    vi.stubEnv("VITE_MOCKS", "");
    const apiCall = vi.fn().mockRejectedValue(new Error("boom"));
    const mockCall = vi.fn().mockReturnValue("mock");

    await expect(resolveWithMocks(apiCall, mockCall)).rejects.toThrow("boom");
    expect(mockCall).not.toHaveBeenCalled();
  });
});

it("does not replace seeded API data with legacy mocks in development", async () => {
  vi.stubEnv("MODE", "development");
  vi.stubEnv("DEV", true);
  vi.stubEnv("VITE_MOCKS", MocksMode.ALWAYS);
  const mockCall = vi.fn();
  await expect(resolveWithMocks(vi.fn().mockRejectedValue(new Error("offline")), mockCall)).rejects.toThrow("offline");
  expect(mockCall).not.toHaveBeenCalled();
});
