import { describe, expect, it } from "vitest";
import { HOLD_MS, SAMPLES, SHAPE_COUNT, STEP_MS, framePoints, shapeRadii, spring, toPath } from "./morphingHexagon.utils";

const radiusAt = (elapsed: number) => framePoints(elapsed).map(([x, y]) => Math.hypot(x - 50, y - 50));
const expectSame = (a: number[], b: number[]) => a.forEach((radius, index) => expect(radius).toBeCloseTo(b[index], 6));
const area = (radii: number[]) => radii.reduce((sum, radius) => sum + radius * radius, 0) * (Math.PI / SAMPLES);

describe("morphingHexagon.utils", () => {
  it("builds distinct shapes with one radius per sample", () => {
    const shapes = Array.from({ length: SHAPE_COUNT }, (_, index) => shapeRadii(index));
    shapes.forEach((radii, index) => {
      expect(radii).toHaveLength(SAMPLES);
      const next = shapes[(index + 1) % SHAPE_COUNT];
      expect(Math.max(...radii.map((radius, sample) => Math.abs(radius - next[sample])))).toBeGreaterThan(1);
    });
  });

  it("keeps a similar area across shapes", () => {
    const areas = Array.from({ length: SHAPE_COUNT }, (_, index) => area(shapeRadii(index)));
    expect(Math.max(...areas) / Math.min(...areas)).toBeLessThan(1.01);
  });

  it("holds the first shape, then morphs and loops the cycle", () => {
    expectSame(radiusAt(0), radiusAt(HOLD_MS));
    expect(radiusAt(HOLD_MS + 300)).not.toEqual(radiusAt(HOLD_MS));
    expectSame(radiusAt(STEP_MS * SHAPE_COUNT), radiusAt(0));
  });

  it("is continuous at the end of each step", () => {
    radiusAt(STEP_MS - 1).forEach((radius, index) => expect(Math.abs(radius - radiusAt(STEP_MS)[index])).toBeLessThan(0.3));
  });

  it("springs from 0 to 1 with a slight overshoot", () => {
    expect(spring(0)).toBe(0);
    expect(spring(1)).toBe(1);
    expect(Math.max(...Array.from({ length: 50 }, (_, index) => spring(index / 50)))).toBeGreaterThan(1);
  });

  it("serializes a closed smooth path", () => {
    expect(toPath(framePoints(0))).toMatch(/^M[\d. ]+(C[\d. -]+){72}Z$/);
  });
});
