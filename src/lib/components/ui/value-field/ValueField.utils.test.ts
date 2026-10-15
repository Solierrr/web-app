import { describe, expect, it } from "vitest";
import { compareValue, valueReference } from "./ValueField.utils";

describe("value comparisons", () => {
  it("ignores missing and non-finite values while preserving zero", () => {
    expect(valueReference([null, undefined, NaN, Infinity])).toBeUndefined();
    expect(valueReference([0, 10, null, NaN])).toEqual({ min: 0, max: 10, mean: 5, count: 2 });
  });
  it("requires two valid observations and a finite value", () => {
    expect(compareValue(10, valueReference([10]))).toBeUndefined();
    expect(compareValue(null, valueReference([10, 20]))).toBeUndefined();
    expect(compareValue(Infinity, valueReference([10, 20]))).toBeUndefined();
  });
  it("compares direction, including a zero reference, without dividing by the mean", () => {
    const reference = valueReference([-1, 1]);
    expect(compareValue(1, reference)).toEqual({ direction: "above", difference: 1, position: 1 });
    expect(compareValue(-1, reference)?.direction).toBe("below");
    expect(compareValue(0, reference)?.direction).toBe("near");
  });
  it("treats equal values and differences invisible at display precision as neutral", () => {
    expect(compareValue(20, valueReference([20, 20]))).toEqual({ direction: "near", difference: 0, position: 0.5 });
    expect(compareValue(20.0001, valueReference([20, 20.0002]), 3)?.direction).toBe("near");
    expect(compareValue(20.1, valueReference([20, 20]), 3)?.direction).toBe("above");
  });
  it("clamps range markers when an external value lies outside the reference range", () => {
    expect(compareValue(50, valueReference([10, 20]))?.position).toBe(1);
    expect(compareValue(0, valueReference([10, 20]))?.position).toBe(0);
  });
});
