import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Skeleton from "./Skeleton";
import { ImageSkeleton } from "./Skeleton.presets";

describe("Skeleton", () => {
  it("should fill its container by default", () => {
    render(<Skeleton data-testid="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");

    expect(skeleton.style.width).toBe("100%");
    expect(skeleton.style.height).toBe("100%");
    expect(skeleton.style.maxWidth).toBe("100%");
    expect(skeleton.style.maxHeight).toBe("100%");
  });

  it("should respect custom dimensions within its container", () => {
    render(<Skeleton data-testid="skeleton" width="12rem" height="3rem" />);

    const skeleton = screen.getByTestId("skeleton");

    expect(skeleton.style.width).toBe("12rem");
    expect(skeleton.style.height).toBe("3rem");
    expect(skeleton.style.maxWidth).toBe("100%");
    expect(skeleton.style.maxHeight).toBe("100%");
  });

  it("should render the image preset with an aspect ratio", () => {
    render(<ImageSkeleton data-testid="image-skeleton" />);

    expect(
      screen.getByTestId("image-skeleton").classList.contains("aspect-square"),
    ).toBe(true);
  });
});
