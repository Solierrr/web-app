import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import "@/config/i18n/internationalization";
import Navbar from "./Navbar";

vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => null }));

describe("Navbar", () => {
  it("opens the search for the current domain", () => {
    render(
      <MemoryRouter initialEntries={["/pt-BR/empresas"]}>
        <Navbar />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "pesquisar" })).toHaveAttribute("href", "/pt-BR/buscar/empresas");
  });
  it("renders the main navigation links", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.queryByRole("link", { name: "Aplicativo" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Produtos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Serviços" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Credenciar-se" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/pt-BR/login");
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
