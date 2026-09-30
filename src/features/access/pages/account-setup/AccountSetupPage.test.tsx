import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import AccountSetupPage from "./AccountSetupPage";

describe("AccountSetupPage", () => {
  it("links to the three onboarding sub-flows", () => {
    render(
      <MemoryRouter>
        <AccountSetupPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /Empresa/ })).toHaveAttribute("href", "/pt-BR/personalizar-perfil/empresa");
    expect(screen.getByRole("link", { name: /Profissional autônomo/ })).toHaveAttribute("href", "/pt-BR/personalizar-perfil/profissional");
    expect(screen.getByRole("link", { name: /Acesso/ })).toHaveAttribute("href", "/pt-BR/personalizar-perfil/acesso");
  });
});
