import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MorphingHexagon from "./MorphingHexagon";

function mockMotion(reduced: boolean) {
  vi.stubGlobal("matchMedia", () => ({ matches: reduced, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
}

describe("MorphingHexagon", () => {
  beforeEach(() => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders a decorative svg with a hexagon path", () => {
    mockMotion(false);
    const { container } = render(<MorphingHexagon />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("path[fill^='url']")?.getAttribute("d")).toMatch(/^M.*Z$/);
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  it("keeps elapsed time nonnegative when the first animation timestamp is earlier than registration", () => {
    mockMotion(false);
    vi.spyOn(performance, "now").mockReturnValue(50);
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    let callback: FrameRequestCallback | undefined;
    vi.mocked(window.requestAnimationFrame).mockImplementation((next) => {
      callback = next;
      return 1;
    });
    const { container } = render(<MorphingHexagon />);
    expect(() => callback?.(20)).not.toThrow();
    expect(container.querySelector("path[fill^='url']")?.getAttribute("d")).toMatch(/^M.*Z$/);
  });

  it.each([
    ["reduced motion", true, false],
    ["paused", false, true],
  ])("stays static on %s", (_, reduced, paused) => {
    mockMotion(reduced);
    const { container } = render(<MorphingHexagon paused={paused} />);

    expect(container.querySelector("path[fill^='url']")?.getAttribute("d")).toBeTruthy();
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });
});
