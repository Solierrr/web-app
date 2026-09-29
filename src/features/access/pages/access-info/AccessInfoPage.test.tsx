import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import AccessInfoPage from "./AccessInfoPage";

describe("AccessInfoPage", () => {
  it("explains that access codes are not available yet and links back", () => {
    render(
      <MemoryRouter>
        <AccessInfoPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/pt-BR/personalizar-perfil");
  });
});
