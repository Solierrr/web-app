import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import ProfessionalCard from "./ProfessionalCard";
import { DEFAULT } from "@/config/i18n/browser/languages";

describe("ProfessionalCard", () => {
  it("offers profile contact without pricing or favorites", () => {
    render(
      <MemoryRouter>
        <ProfessionalCard
          lang={DEFAULT}
          professional={{ id: "technician", name: "Ana Costa", slug: "ana-costa", crea: "SP123", professions: ["Instalação"] }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Entrar em contato: Ana Costa" })).toHaveAttribute("href", "/pt-BR/profissional/ana-costa#contato");
    expect(screen.queryByRole("button", { name: /salvar|favorit/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument();
  });
});
