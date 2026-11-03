import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import "@/config/i18n/internationalization";
import { DEFAULT as DEFAULT_LANGUAGE } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
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
    expect(screen.getByRole("link", { name: "Carrinho" })).toHaveAttribute("href", "/pt-BR/carrinho");
    expect(screen.queryByRole("link", { name: "Suporte" })).not.toBeInTheDocument();
  });

  it("sends visitors straight to the login page without opening a menu", () => {
    render(
      <MemoryRouter initialEntries={["/pt-BR/empresas"]}>
        <Routes>
          <Route path="/pt-BR/empresas" element={<Navbar />} />
          <Route path={routePaths.login(DEFAULT_LANGUAGE)} element={<p>login page</p>} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
    expect(screen.getByText("login page")).toBeInTheDocument();
  });

  it("has no logo and keeps the standard navbar height", () => {
    const { container } = render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );
    expect(container.querySelector("header img")).toBeNull();
    expect(container.querySelector("header .navbar-frame")).not.toBeNull();
    expect(container.querySelector("header .navbar-frame")?.className).not.toContain("min-h-16");
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
