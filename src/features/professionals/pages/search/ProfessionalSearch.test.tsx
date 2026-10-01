import { render, screen } from "@testing-library/react";
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

    expect(await screen.findByRole("heading", { name: "Profissionais" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "filtrar-busca" })).toBeInTheDocument();
    expect(screen.getByText("Instalação")).toBeInTheDocument();
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
