import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useMarketplacePagination } from "./marketplace.hooks";

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
