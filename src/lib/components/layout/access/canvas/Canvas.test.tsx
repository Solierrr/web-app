import { fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Canvas from "./Canvas";

const { frames, draw } = vi.hoisted(() => ({
  frames: [] as boolean[],
  draw: vi.fn((scene: { pointer: { active: boolean } }) => {
    frames.push(scene.pointer.active);
    return false;
  }),
}));

vi.mock("./Grid.utils", () => ({ GRID_CELL_SIZE: 46, createGridRenderer: () => draw }));

let intersect: (entries: { isIntersecting: boolean }[]) => void;
let resize: () => void;
let nextFrame: FrameRequestCallback | undefined;

function tick() {
  const callback = nextFrame;
  nextFrame = undefined;
  callback?.(performance.now() + 16);
}

function hover(canvas: HTMLCanvasElement) {
  fireEvent.pointerMove(canvas, { offsetX: 10, offsetY: 10 });
  tick();
  expect(frames.at(-1)).toBe(true);
}

describe("Canvas pointer lifecycle", () => {
  beforeEach(() => {
    frames.length = 0;
    nextFrame = undefined;
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ setTransform: vi.fn() } as never);
    vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({ width: 200, height: 200 } as DOMRect);
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback: FrameRequestCallback) => {
        nextFrame = callback;
        return 1;
      }),
    );
    vi.stubGlobal(
      "cancelAnimationFrame",
      vi.fn(() => {
        nextFrame = undefined;
      }),
    );
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: typeof resize) {
          resize = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: typeof intersect) {
          intersect = callback;
        }
        observe() {
          intersect([{ isIntersecting: true }]);
        }
        disconnect() {}
      },
    );
    vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("tracks exposed page areas through layout wrappers and ignores controls", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({ left: 0, top: 0, width: 200, height: 200 } as DOMRect);
    const { container } = render(
      <main>
        <Canvas variant="grid" interactionScope="page" />
        <div data-testid="layout">
          <button>Action</button>
        </div>
      </main>,
    );
    const layout = container.querySelector("[data-testid='layout']")!;
    const move = (element: Element, x: number) => {
      const event = new Event("pointermove", { bubbles: true });
      Object.defineProperties(event, { clientX: { value: x }, clientY: { value: 10 } });
      fireEvent(element, event);
      tick();
    };
    move(layout, 10);
    expect(frames.at(-1)).toBe(true);
    move(container.querySelector("button")!, 10);
    expect(frames.at(-1)).toBe(false);
    move(layout, 10);
    move(layout, 250);
    expect(frames.at(-1)).toBe(false);
  });

  it.each(["blur", "scroll"])("releases hover on window %s without a pointerleave event", (event) => {
    const { container } = render(<Canvas variant="grid" />);
    hover(container.querySelector("canvas")!);
    fireEvent(window, new Event(event));
    tick();
    expect(frames.at(-1)).toBe(false);
  });

  it("stays idle while the pointer moves over a form", () => {
    const { container } = render(
      <main>
        <Canvas variant="grid" interactionScope="page" />
        <form><input name="brand" /></form>
      </main>,
    );
    vi.mocked(requestAnimationFrame).mockClear();
    vi.mocked(HTMLCanvasElement.prototype.getBoundingClientRect).mockClear();
    draw.mockClear();
    const input = container.querySelector("input")!;
    for (let i = 0; i < 20; i++) {
      fireEvent.pointerMove(input);
      tick();
    }
    expect(requestAnimationFrame).not.toHaveBeenCalled();
    expect(HTMLCanvasElement.prototype.getBoundingClientRect).not.toHaveBeenCalled();
    expect(draw).not.toHaveBeenCalled();
  });

  it("does not restore an old hover when the canvas returns to view", () => {
    const { container } = render(<Canvas variant="grid" />);
    hover(container.querySelector("canvas")!);
    intersect([{ isIntersecting: false }]);
    intersect([{ isIntersecting: true }]);
    expect(frames.at(-1)).toBe(false);
  });

  it("releases a cancelled pointer interaction", () => {
    const { container } = render(<Canvas variant="grid" />);
    const canvas = container.querySelector("canvas")!;
    hover(canvas);
    fireEvent.pointerCancel(canvas);
    tick();
    expect(frames.at(-1)).toBe(false);
  });

  it("releases the hovered cell when resizing", () => {
    const { container } = render(<Canvas variant="grid" />);
    hover(container.querySelector("canvas")!);
    resize();
    expect(frames.at(-1)).toBe(false);
  });
});
