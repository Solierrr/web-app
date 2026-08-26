import { afterEach, describe, expect, it, vi } from "vitest";

import MocksMode from "@/domain/enum/mocksMode";

import { resolveWithMocks } from "./fallback.service";

describe("resolveWithMocks", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the mock without calling the API when mode is ALWAYS", async () => {
    vi.stubEnv("VITE_MOCKS", MocksMode.Always);
    const apiCall = vi.fn();
    const mockCall = vi.fn().mockReturnValue("mock");

    const result = await resolveWithMocks(apiCall, mockCall);

    expect(result).toBe("mock");
    expect(apiCall).not.toHaveBeenCalled();
  });

  it("calls only the API and propagates errors when mode is DEACTIVATED", async () => {
    vi.stubEnv("VITE_MOCKS", MocksMode.Deactivated);
    const apiCall = vi.fn().mockRejectedValue(new Error("boom"));
    const mockCall = vi.fn();

    await expect(resolveWithMocks(apiCall, mockCall)).rejects.toThrow("boom");
    expect(mockCall).not.toHaveBeenCalled();
  });

  it("returns the API result when mode is FALLBACK and the API succeeds", async () => {
    vi.stubEnv("VITE_MOCKS", MocksMode.Fallback);
    const apiCall = vi.fn().mockResolvedValue("api");
    const mockCall = vi.fn();

    const result = await resolveWithMocks(apiCall, mockCall);

    expect(result).toBe("api");
    expect(mockCall).not.toHaveBeenCalled();
  });

  it("falls back to the mock when mode is FALLBACK and the API fails", async () => {
    vi.stubEnv("VITE_MOCKS", MocksMode.Fallback);
    const apiCall = vi.fn().mockRejectedValue(new Error("boom"));
    const mockCall = vi.fn().mockReturnValue("mock");

    const result = await resolveWithMocks(apiCall, mockCall);

    expect(result).toBe("mock");
  });

  it("defaults to the FALLBACK behavior when VITE_MOCKS is unset or invalid", async () => {
    vi.stubEnv("VITE_MOCKS", "");
    const apiCall = vi.fn().mockRejectedValue(new Error("boom"));
    const mockCall = vi.fn().mockReturnValue("mock");

    const result = await resolveWithMocks(apiCall, mockCall);

    expect(result).toBe("mock");
  });
});
