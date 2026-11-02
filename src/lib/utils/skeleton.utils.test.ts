import { describe, expect, it } from "vitest";
import { skeletonKeys } from "./skeleton.utils";

describe("skeletonKeys", () => {
  it("gera chaves únicas e estáveis", () => {
    expect(skeletonKeys(3)).toEqual(["skeleton-1", "skeleton-2", "skeleton-3"]);
    expect(new Set(skeletonKeys(6)).size).toBe(6);
  });

  it("devolve lista vazia para zero", () => {
    expect(skeletonKeys(0)).toEqual([]);
  });
});
