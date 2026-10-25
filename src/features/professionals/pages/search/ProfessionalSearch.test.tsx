import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ProfessionalSearch from "./ProfessionalSearch";

vi.mock("@/features/professionals/professional.service", () => ({
  getCatalogTechnicians: vi.fn(),
}));

import { getCatalogTechnicians, type CatalogTechnician } from "@/features/professionals/professional.service";

const mockedGetCatalogTechnicians = vi.mocked(getCatalogTechnicians);

const items: CatalogTechnician[] = [
  { id: "professional-1", name: "Carlos Eduardo Lima", slug: "carlos-eduardo-lima", crea: "MG-123456", professions: ["Engenheiro Eletricista"] },
];

describe("ProfessionalSearch", () => {
  it("filters the service catalog by name and keeps professional contact separate from offers", async () => {
    mockedGetCatalogTechnicians.mockResolvedValue(items);
    render(
      <MemoryRouter>
        <ProfessionalSearch />
      </MemoryRouter>,
    );
    await screen.findByText("Carlos Eduardo Lima");
    const query = screen.getByRole("searchbox", { name: "Buscar serviços" });
    fireEvent.change(query, { target: { value: "eletricista" } });
    expect(screen.getByText("Carlos Eduardo Lima")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Entrar em contato:/ })).toHaveAttribute("href", "/pt-BR/profissional/carlos-eduardo-lima#contato");
    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument();
    fireEvent.change(query, { target: { value: "painel 550" } });
    expect(screen.queryByText("Carlos Eduardo Lima")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Nenhum resultado corresponde à sua busca.");
  });
  beforeEach(() => {
    mockedGetCatalogTechnicians.mockReset();
  });

  it("renders the page heading and filter controls once the catalog loads", async () => {
    mockedGetCatalogTechnicians.mockResolvedValue(items);

    render(
      <MemoryRouter>
        <ProfessionalSearch />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Encontre quem pode ajudar." })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Especialidade" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Buscar serviços" })).toBeInTheDocument();
  });

  it("renders the mocked professionals in the results grid", async () => {
    mockedGetCatalogTechnicians.mockResolvedValue(items);

    render(
      <MemoryRouter>
        <ProfessionalSearch />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Carlos Eduardo Lima")).toBeInTheDocument();
  });
});
