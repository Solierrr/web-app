import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Icon, { type IconName } from "./Icon";
import Colors from "@/lib/shared/styles/colors/colors.enum";
import { InvalidIconError } from "@/features/error/invalid-icon/InvalidIcon.error";
import { ACCOUNT_SQUARE, ACCOUNT_HEXAGON, ACCOUNT_PENTAGON, FOLDER_CLOSED, FOLDER_OPEN } from "./Icon.motion.paths";

describe("Icon", () => {
  it("does not add an outline to filled brand icons", () => {
    const { container } = render(
      <>
        <Icon name="google" strokeWidth={3} />
        <Icon name="microsoft" strokeWidth={3} />
        <Icon name="home" strokeWidth={3} />
      </>,
    );
    const icons = container.querySelectorAll("svg");
    expect(icons[0]).toHaveAttribute("stroke-width", "0");
    expect(icons[1]).toHaveAttribute("stroke-width", "0");
    expect(icons[2]).toHaveAttribute("stroke-width", "3");
  });
  it("animates one SVG contour while keeping the user drawing in place", () => {
    const { container } = render(<Icon name="account" motion="account" size={20} />);
    expect(container.querySelectorAll("svg")).toHaveLength(1);
    expect(container.querySelectorAll(".icon-contour")).toHaveLength(1);
    expect(container.querySelector("svg")).toHaveAttribute("width", "20");
    expect(container.querySelector(".icon-contour")).toHaveAttribute("d", ACCOUNT_SQUARE);
  });

  it("uses matching SVG commands so shapes interpolate instead of switching", () => {
    const commands = (path: string) => path.match(/[A-Za-z]/g);
    expect(commands(ACCOUNT_SQUARE)).toEqual(commands(ACCOUNT_HEXAGON));
    expect(commands(ACCOUNT_SQUARE)).toEqual(commands(ACCOUNT_PENTAGON));
    expect(commands(FOLDER_CLOSED)).toEqual(commands(FOLDER_OPEN));
  });
  it("renders an svg for a known icon name", () => {
    const { container } = render(<Icon name="home" />);

    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("throws InvalidIconError for an unknown icon name", () => {
    expect(() => render(<Icon name={"not-an-icon" as IconName} />)).toThrow(InvalidIconError);
  });

  it("applies default size, color and strokeWidth", () => {
    const { container } = render(<Icon name="home" />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
    expect(svg).toHaveAttribute("stroke", Colors.BLACK);
    expect(svg).toHaveAttribute("stroke-width", "2");
  });

  it("respects custom size, color and strokeWidth", () => {
    const { container } = render(<Icon name="user" size={48} color={Colors.ORANGE} strokeWidth={1.5} />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "48");
    expect(svg).toHaveAttribute("height", "48");
    expect(svg).toHaveAttribute("stroke", Colors.ORANGE);
    expect(svg).toHaveAttribute("stroke-width", "1.5");
  });

  it("scales strokeWidth relative to size when absoluteStrokeWidth is true", () => {
    const { container } = render(<Icon name="settings" size={48} strokeWidth={2} absoluteStrokeWidth />);

    const svg = container.querySelector("svg");
    // absoluteStrokeWidth keeps the *visual* stroke width constant: strokeWidth * 24 / size
    expect(svg).toHaveAttribute("stroke-width", "1");
  });

  it("merges a custom className with the Tabler default classes", () => {
    const { container } = render(<Icon name="search" className="mx-2" />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("tabler-icon", "mx-2");
  });

  it("is aria-hidden by default (decorative icon)", () => {
    const { container } = render(<Icon name="home" />);

    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("preserves the stroke weight and gives each gradient a unique reference", () => {
    const { container } = render(
      <>
        <Icon name="sparkles" gradient="orange" strokeWidth={1.5} />
        <Icon name="sparkles" gradient="orange" />
      </>,
    );
    const svgs = container.querySelectorAll("svg");
    const gradients = container.querySelectorAll("linearGradient");
    expect(svgs[0]).toHaveAttribute("stroke-width", "1.5");
    expect(gradients[0].id).not.toBe(gradients[1].id);
    expect(svgs[0]).toHaveAttribute("stroke", `url(#${gradients[0].id})`);
    expect(svgs[1]).toHaveAttribute("stroke", `url(#${gradients[1].id})`);
  });
});
