import { describe, expect, it, vi } from "vitest";
import { HttpResponseError } from "./http.service";
import { LOAD_RETRY_POLICY, abortableDelay, backoffDelay, isTransientFailure, retryWithBackoff } from "./retry.utils";

const httpError = (status: number) => new Error("failed", { cause: new HttpResponseError(status, "HTTP_ERROR") });
const networkError = () => new Error("failed", { cause: new TypeError("Failed to fetch") });

describe("isTransientFailure", () => {
  it("retries network, timeout, unavailable and rate limited failures", () => {
    expect(isTransientFailure(networkError())).toBe(true);
    expect(isTransientFailure(new Error("x", { cause: new DOMException("t", "TimeoutError") }))).toBe(true);
    for (const status of [500, 502, 503, 504, 429]) expect(isTransientFailure(httpError(status))).toBe(true);
  });

  it("does not retry what repeating cannot fix", () => {
    for (const status of [400, 401, 403, 404, 422]) expect(isTransientFailure(httpError(status))).toBe(false);
    expect(isTransientFailure(new Error("parse error"))).toBe(false);
  });
});

describe("backoffDelay", () => {
  it("doubles up to the ceiling with half of it fixed and half random", () => {
    expect(backoffDelay(1, LOAD_RETRY_POLICY, () => 0)).toBe(500);
    expect(backoffDelay(1, LOAD_RETRY_POLICY, () => 1)).toBe(1_000);
    expect(backoffDelay(3, LOAD_RETRY_POLICY, () => 1)).toBe(4_000);
    expect(backoffDelay(5, LOAD_RETRY_POLICY, () => 1)).toBe(16_000);
    expect(backoffDelay(9, LOAD_RETRY_POLICY, () => 1)).toBe(30_000);
    expect(backoffDelay(9, LOAD_RETRY_POLICY, () => 0)).toBe(15_000);
  });
});

describe("retryWithBackoff", () => {
  const wait = vi.fn<(ms: number, signal?: AbortSignal) => Promise<void>>(async () => undefined);

  it("returns the first success without waiting", async () => {
    wait.mockClear();
    await expect(retryWithBackoff(async () => "ok", { wait })).resolves.toBe("ok");
    expect(wait).not.toHaveBeenCalled();
  });

  it("repeats transient failures until one succeeds", async () => {
    wait.mockClear();
    const operation = vi.fn().mockRejectedValueOnce(networkError()).mockRejectedValueOnce(httpError(503)).mockResolvedValue("ok");
    const onRetry = vi.fn();
    await expect(retryWithBackoff(operation, { wait, onRetry, random: () => 1 })).resolves.toBe("ok");
    expect(operation).toHaveBeenCalledTimes(3);
    expect(wait.mock.calls.map((call) => call[0])).toEqual([1_000, 2_000]);
    expect(onRetry).toHaveBeenCalledTimes(2);
  });

  it("gives up after the configured attempts and throws the last error", async () => {
    wait.mockClear();
    const last = httpError(503);
    const operation = vi.fn().mockRejectedValue(last);
    await expect(retryWithBackoff(operation, { wait, policy: { attempts: 4, baseMs: 10, maxMs: 100 } })).rejects.toBe(last);
    expect(operation).toHaveBeenCalledTimes(4);
    expect(wait).toHaveBeenCalledTimes(3);
  });

  it("fails right away on a failure that is not transient", async () => {
    wait.mockClear();
    const operation = vi.fn().mockRejectedValue(httpError(404));
    await expect(retryWithBackoff(operation, { wait })).rejects.toThrow("failed");
    expect(operation).toHaveBeenCalledTimes(1);
    expect(wait).not.toHaveBeenCalled();
  });

  it("stops when the signal is aborted", async () => {
    const controller = new AbortController();
    const operation = vi.fn().mockImplementation(async () => {
      controller.abort();
      throw networkError();
    });
    await expect(retryWithBackoff(operation, { wait, signal: controller.signal })).rejects.toThrow("failed");
    expect(operation).toHaveBeenCalledTimes(1);
  });
});

describe("abortableDelay", () => {
  it("resolves after the time and rejects when aborted", async () => {
    vi.useFakeTimers();
    const done = abortableDelay(1_000);
    await vi.advanceTimersByTimeAsync(1_000);
    await expect(done).resolves.toBeUndefined();
    const controller = new AbortController();
    const pending = abortableDelay(60_000, controller.signal);
    controller.abort();
    await expect(pending).rejects.toBeDefined();
    vi.useRealTimers();
  });
});
