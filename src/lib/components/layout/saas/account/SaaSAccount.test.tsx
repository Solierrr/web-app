import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { DEFAULT } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import SaaSAccount from "./SaaSAccount";

describe("SaaSAccount", () => {
  it("opens a menu with a noninteractive email and toggles closed", () => {
    render(
      <MemoryRouter>
        <SaaSAccount email="pessoal@example.test" />
      </MemoryRouter>,
    );
    const trigger = screen.getByRole("button", { name: "Sua conta" });
    fireEvent.click(trigger);
    expect(screen.getByText("pessoal@example.test")).not.toHaveAttribute("tabindex");
    expect(screen.getAllByRole("menuitem")).toHaveLength(2);
    expect(screen.queryByText(/Conta administrada/)).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    fireEvent.mouseDown(trigger);
    fireEvent.click(trigger);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("shows the managing company even on a personal route and restores focus on Escape", () => {
    render(
      <MemoryRouter initialEntries={[routePaths.ownUserProfile(DEFAULT)]}>
        <SaaSAccount email="funcionario@example.test" managedCompanyName="Empresa Solar" />
      </MemoryRouter>,
    );
    const trigger = screen.getByRole("button", { name: "Sua conta" });
    fireEvent.click(trigger);
    expect(screen.getByText("Conta administrada por Empresa Solar")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Configurações" })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(screen.getByRole("menuitem", { name: "Meu perfil" })).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it.each([
    ["Configurações", routePaths.settings(DEFAULT)],
    ["Meu perfil", routePaths.ownUserProfile(DEFAULT)],
  ])("navigates to %s only after selecting the menu item", (label, path) => {
    render(
      <MemoryRouter initialEntries={["/account"]}>
        <Routes>
          <Route path="/account" element={<SaaSAccount email="pessoal@example.test" />} />
          <Route path={path} element={<h1>{label}</h1>} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Sua conta" }));
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitem", { name: label }));
    expect(screen.getByRole("heading", { name: label })).toBeInTheDocument();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
