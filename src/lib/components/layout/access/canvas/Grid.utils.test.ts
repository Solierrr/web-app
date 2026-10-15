import { afterEach, describe, expect, it, vi } from "vitest";
import { createGridRenderer } from "./Grid.utils";
import type { CanvasScene } from "./Canvas.utils";

function setup() {
  const backdrop = {
    setTransform: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    fillStyle: "",
    strokeStyle: "",
    globalAlpha: 1,
    lineWidth: 1,
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(backdrop as never);
  vi.stubGlobal(
    "Path2D",
    class {
      roundRect() {}
    },
  );
  const ctx = {
    canvas: { width: 230, height: 230 },
    getTransform: () => ({ a: 1 }),
    save: vi.fn(),
    restore: vi.fn(),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    fill: vi.fn(),
    globalAlpha: 1,
    fillStyle: "",
  };
  const scene: CanvasScene = {
    width: 230,
    height: 230,
    time: 0,
    pointer: { x: 23, y: 23, active: false },
    ripple: null,
    ripples: [],
    orange: "#ff6500",
    neutral: "#797979",
    surface: "#fafafa",
  };
  return { backdrop, ctx, scene, draw: createGridRenderer(ctx as unknown as CanvasRenderingContext2D) };
}

function settle(draw: (scene: CanvasScene) => boolean, scene: CanvasScene) {
  for (let i = 0; i < 300; i++) {
    scene.time += 1 / 60;
    if (!draw(scene)) return;
  }
  throw new Error("Animation did not settle");
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Grid renderer", () => {
  it("does not bake permanent squares into the background", () => {
    const { backdrop, ctx, scene, draw } = setup();
    draw(scene);
    expect(backdrop.stroke).toHaveBeenCalled();
    expect(backdrop.fill).not.toHaveBeenCalled();
    expect(ctx.fill).not.toHaveBeenCalled();
  });

  it("restores the background after hover fades", () => {
    const { ctx, scene, draw } = setup();
    draw(scene);
    scene.pointer.active = true;
    settle(draw, scene);
    expect(ctx.fill).toHaveBeenCalled();
    scene.pointer.active = false;
    settle(draw, scene);
    const lastPaint = ctx.fill.mock.invocationCallOrder.at(-1)!;
    ctx.fill.mockClear();
    expect(draw(scene)).toBe(false);
    expect(ctx.fill).not.toHaveBeenCalled();
    const calls = ctx.drawImage.mock.invocationCallOrder;
    expect(calls.at(-1)).toBeGreaterThan(lastPaint);
  });

  it("restores the last painted cells after a click ripple ends", () => {
    const { ctx, scene, draw } = setup();
    draw(scene);
    scene.ripple = { x: 23, y: 23, time: 0 };
    scene.ripples.push(scene.ripple);
    settle(draw, scene);
    const lastPaint = ctx.fill.mock.invocationCallOrder.at(-1)!;
    expect(lastPaint).toBeDefined();
    expect(ctx.drawImage.mock.invocationCallOrder.at(-1)).toBeGreaterThan(lastPaint);
    ctx.fill.mockClear();
    expect(draw(scene)).toBe(false);
    expect(ctx.fill).not.toHaveBeenCalled();
  });
});
