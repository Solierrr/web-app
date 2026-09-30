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
    expect(screen.getByText("CREA: MG-123456")).toBeInTheDocument();
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
