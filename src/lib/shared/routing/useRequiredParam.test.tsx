import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { useRequiredParam } from "./useRequiredParam";

function wrapper(path: string, pattern: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={pattern} element={children} />
        </Routes>
      </MemoryRouter>
    );
  };
}

describe("useRequiredParam", () => {
  it("returns the value when the parameter is present", () => {
    const { result } = renderHook(() => useRequiredParam("itemId"), { wrapper: wrapper("/items/abc", "/items/:itemId") });
    expect(result.current).toBe("abc");
  });

  it("returns null when the parameter is not part of the route", () => {
    const { result } = renderHook(() => useRequiredParam("itemId"), { wrapper: wrapper("/items", "/items") });
    expect(result.current).toBeNull();
  });

  it("returns null when the parameter is blank", () => {
    const { result } = renderHook(() => useRequiredParam("itemId"), { wrapper: wrapper("/items/%20", "/items/:itemId") });
    expect(result.current).toBeNull();
  });
});
