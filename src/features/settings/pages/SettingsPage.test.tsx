import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import SettingsPage from "./SettingsPage";

describe("SettingsPage", () => {
  it("links to the profile and security pages", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Perfil" })).toHaveAttribute("href", "/pt-BR/usuario");
    expect(screen.getByRole("link", { name: "Segurança" })).toHaveAttribute("href", "/pt-BR/configuracoes/seguranca");
  });
});
