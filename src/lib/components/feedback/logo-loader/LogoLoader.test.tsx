import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import LogoLoader from "./LogoLoader";

describe("LogoLoader", () => {
  it("should expose a status with the given label", () => {
    render(<LogoLoader label="Carregando mensagens" />);

    expect(screen.getByRole("status", { name: "Carregando mensagens" })).toBeInTheDocument();
  });

  it("should keep the mark hidden from assistive technology and without its own background surface", () => {
    render(<LogoLoader size={6} />);

    const mark = screen.getByTestId("logo-loader-mark");

    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(mark.style.width).toBe("6rem");
    expect(screen.getByRole("status").className).not.toMatch(/bg-white/);
  });
});
