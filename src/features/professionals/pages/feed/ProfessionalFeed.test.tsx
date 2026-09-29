import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ProfessionalFeed from "./ProfessionalFeed";

vi.mock("@/features/professionals/professional.service", () => ({
  getCatalogTechnicians: vi.fn(),
}));

import { getCatalogTechnicians, type CatalogTechnician } from "@/features/professionals/professional.service";

const mockedGetCatalogTechnicians = vi.mocked(getCatalogTechnicians);

const items: CatalogTechnician[] = [
  { id: "professional-1", name: "Carlos Eduardo Lima", slug: "carlos-eduardo-lima", crea: "MG-123456", professions: ["Engenheiro Eletricista"] },
];

describe("ProfessionalFeed", () => {
  beforeEach(() => {
    mockedGetCatalogTechnicians.mockReset();
  });

  it("renders a skeleton while the professionals are loading", () => {
    mockedGetCatalogTechnicians.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <ProfessionalFeed />
      </MemoryRouter>,
    );

    expect(screen.queryByText("Carlos Eduardo Lima")).not.toBeInTheDocument();
  });

  it("renders the mocked professionals once loaded", async () => {
    mockedGetCatalogTechnicians.mockResolvedValue(items);

    render(
      <MemoryRouter>
        <ProfessionalFeed />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Carlos Eduardo Lima")).toBeInTheDocument();
  });

  it("shows an error message when loading fails", async () => {
    mockedGetCatalogTechnicians.mockRejectedValue(new Error("offline"));

    render(
      <MemoryRouter>
        <ProfessionalFeed />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
