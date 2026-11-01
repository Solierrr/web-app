import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HttpResponseError } from "@/lib/shared/http/http.service";
import { useMarketplaceCatalog, useMarketplacePagination } from "./marketplace.hooks";

describe("marketplace pagination", () => {
  it("partitions the catalogue without duplicates and resets when the filter changes", () => {
    const items = Array.from({ length: 29 }, (_, i) => i);
    const { result, rerender } = renderHook(({ key, values }) => useMarketplacePagination(values, key), {
      initialProps: { key: "all", values: items },
    });
    expect(result.current.items).toEqual(items.slice(0, 12));
    act(() => result.current.pagination.onPageChange(2));
    expect(result.current.items).toEqual(items.slice(12, 24));
    act(() => result.current.pagination.onPageChange(3));
    expect(result.current.items).toEqual(items.slice(24));
    rerender({ key: "filtered", values: items.slice(0, 15) });
    expect(result.current.pagination.page).toBe(1);
    expect(result.current.items).toHaveLength(12);
    rerender({ key: "all", values: items });
    expect(result.current.pagination.page).toBe(1);
  });
  it("clamps the current page after records disappear", () => {
    const { result, rerender } = renderHook(({ values }) => useMarketplacePagination(values, "all"), {
      initialProps: { values: Array.from({ length: 25 }, (_, i) => i) },
    });
    act(() => result.current.pagination.onPageChange(3));
    rerender({ values: [1, 2] });
    expect(result.current.pagination.page).toBe(1);
    expect(result.current.items).toEqual([1, 2]);
    rerender({ values: [] });
    expect(result.current.items).toEqual([]);
  });
});

describe("marketplace catalog loading", () => {
  afterEach(() => vi.useRealTimers());
  const unavailable = () => new Error("failed", { cause: new HttpResponseError(503, "HTTP_ERROR") });

  it("keeps loading while it retries a transient failure and then shows the result", async () => {
    vi.useFakeTimers();
    const load = vi.fn().mockRejectedValueOnce(unavailable()).mockRejectedValueOnce(unavailable()).mockResolvedValue(["a"]);
    const { result } = renderHook(() => useMarketplaceCatalog(load));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current).toMatchObject({ items: null, error: false });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(40_000);
    });
    expect(result.current).toMatchObject({ items: ["a"], error: false });
    expect(load).toHaveBeenCalledTimes(3);
  });

  it("reports the error only after the attempts are over", async () => {
    vi.useFakeTimers();
    const load = vi.fn().mockRejectedValue(unavailable());
    const { result } = renderHook(() => useMarketplaceCatalog(load));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });
    expect(result.current.error).toBe(false);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10 * 60_000);
    });
    expect(result.current.error).toBe(true);
    expect(load).toHaveBeenCalledTimes(10);
  });

  it("fails right away when repeating cannot help", async () => {
    const load = vi.fn().mockRejectedValue(new Error("failed", { cause: new HttpResponseError(404, "NOT_FOUND") }));
    const { result } = renderHook(() => useMarketplaceCatalog(load));
    await waitFor(() => expect(result.current.error).toBe(true));
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("starts over when retry is called", async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error("failed", { cause: new HttpResponseError(404, "NOT_FOUND") }))
      .mockResolvedValue(["b"]);
    const { result } = renderHook(() => useMarketplaceCatalog(load));
    await waitFor(() => expect(result.current.error).toBe(true));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.items).toEqual(["b"]));
  });
});
