import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import "@/config/locales/internationalization";
import Navbar from "./Navbar";

describe("Navbar", () => {
  it("renders the main navigation links", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Aplicativo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Placas Solares" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Profissionais" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Credenciar-se" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Suporte" })).toBeInTheDocument();
  });

  it("renders the language switcher", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: "Idioma" })).toBeInTheDocument();
  });
});
