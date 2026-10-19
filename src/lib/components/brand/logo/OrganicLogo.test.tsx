import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OrganicLogo from "./OrganicLogo";
import { renderToStaticMarkup } from "react-dom/server";

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: true })),
  );
});
afterEach(() => vi.unstubAllGlobals());

describe("OrganicLogo", () => {
  it("includes the visible shape in its initial markup before animation starts", () => {
    const markup = renderToStaticMarkup(<OrganicLogo interactive />);
    expect(markup.match(/<path[^>]* d="M/g)).toHaveLength(3);
  });
  it("changes shape on activation even when reduced motion disables animation", () => {
    render(<OrganicLogo interactive width={7} />);
    const button = screen.getByRole("button", { name: "Mudar a forma da logo" });
    const path = button.querySelector("g[filter] path");
    const initial = path?.getAttribute("d");
    expect(initial).toBeTruthy();
    fireEvent.click(button);
    expect(path?.getAttribute("d")).not.toBe(initial);
    expect(button).toHaveAttribute("type", "button");
  });

  it("keeps the standard logo non-interactive", () => {
    render(<OrganicLogo />);
    expect(screen.getByRole("img", { name: "Solaria" })).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
