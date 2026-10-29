import { describe, expect, it, vi } from "vitest";
import { HttpResponseError, httpJson } from "./http.service";
import { classifyHttpFailure } from "./httpFailure.utils";

const withStatus = (status: number) => new Error(`HTTP ${status}`, { cause: new HttpResponseError(status, "HTTP_ERROR") });

describe("classifyHttpFailure", () => {
  it.each([
    [401, "unauthorized"],
    [403, "forbidden"],
    [429, "rateLimited"],
    [413, "tooLarge"],
    [422, "invalid"],
    [503, "unavailable"],
    [502, "unavailable"],
    [404, "unknown"],
  ])("maps HTTP %i to %s", (status, kind) => {
    expect(classifyHttpFailure(withStatus(status))).toBe(kind);
  });

  it("recognizes timeouts and lost connections", () => {
    expect(classifyHttpFailure(new Error("x", { cause: new DOMException("slow", "TimeoutError") }))).toBe("timeout");
    expect(classifyHttpFailure(new Error("x", { cause: new TypeError("Failed to fetch") }))).toBe("network");
    expect(classifyHttpFailure(new Error("x"))).toBe("unknown");
  });
});

describe("httpJson timeout", () => {
  it("aborts the request when the time limit is set", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({}) });
    vi.stubGlobal("fetch", fetchMock);

    await httpJson("https://service.example/test", { service: "t", operation: "t", errorMessage: "x", timeoutMs: 5_000 });

    expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
    vi.unstubAllGlobals();
  });
});
