import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ProfessionalProfile from "./ProfessionalProfile";

vi.mock("@/features/professionals/professional.service", () => ({
  getCatalogTechnicianBySlug: vi.fn(),
}));

import { getCatalogTechnicianBySlug, type CatalogTechnician } from "@/features/professionals/professional.service";

const mockedGetCatalogTechnicianBySlug = vi.mocked(getCatalogTechnicianBySlug);

const professional: CatalogTechnician = {
  id: "professional-1",
  name: "Carlos Eduardo Lima",
  slug: "carlos-eduardo-lima",
  crea: "MG-123456",
  professions: ["Engenheiro Eletricista"],
};

describe("ProfessionalProfile", () => {
  it("uses public contact details when available and shows an honest unavailable state otherwise", async () => {
    mockedGetCatalogTechnicianBySlug.mockResolvedValue({ ...professional, contact: { email: "ana@example.test", number: "+55 (11) 99999-1234" } });
    render(
      <MemoryRouter>
        <ProfessionalProfile />
      </MemoryRouter>,
    );
    expect(await screen.findByRole("link", { name: "Enviar e-mail" })).toHaveAttribute("href", "mailto:ana%40example.test");
    expect(screen.getByRole("link", { name: "Ligar" })).toHaveAttribute("href", "tel:+5511999991234");
    expect(screen.queryByText("Este profissional ainda não disponibilizou contato público.")).not.toBeInTheDocument();
  });
  beforeEach(() => {
    mockedGetCatalogTechnicianBySlug.mockReset();
  });

  it("renders a skeleton while the professional is loading", () => {
    mockedGetCatalogTechnicianBySlug.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <ProfessionalProfile />
      </MemoryRouter>,
    );

    expect(screen.queryByText("Carlos Eduardo Lima")).not.toBeInTheDocument();
  });

  it("renders the mocked professional once loaded", async () => {
    mockedGetCatalogTechnicianBySlug.mockResolvedValue(professional);

    render(
      <MemoryRouter>
        <ProfessionalProfile />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Carlos Eduardo Lima" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Registro profissional" })).toBeInTheDocument();
    expect(screen.getByText("MG-123456")).toBeInTheDocument();
  });

  it("shows an error message when loading fails", async () => {
    mockedGetCatalogTechnicianBySlug.mockRejectedValue(new Error("not found"));

    render(
      <MemoryRouter>
        <ProfessionalProfile />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
