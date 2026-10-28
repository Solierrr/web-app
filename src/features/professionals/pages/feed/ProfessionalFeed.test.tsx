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

    for (const link of await screen.findAllByRole("link", { name: "Carlos Eduardo Lima" })) {
      expect(link).toHaveAttribute("href", "/pt-BR/profissional/carlos-eduardo-lima");
    }
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

  it("keeps more than twelve professionals accessible without pagination", async () => {
    mockedGetCatalogTechnicians.mockResolvedValue(
      Array.from({ length: 24 }, (_, index) => ({
        ...items[0],
        id: `professional-${index}`,
        slug: `professional-${index}`,
        name: `Profissional ${index + 1}`,
        professions: [],
      })),
    );
    render(
      <MemoryRouter>
        <ProfessionalFeed />
      </MemoryRouter>,
    );
    expect((await screen.findAllByRole("link", { name: "Profissional 24" }))[0]).toHaveAttribute("href", "/pt-BR/profissional/professional-23");
    expect(screen.queryByRole("button", { name: "Próxima página" })).not.toBeInTheDocument();
    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument();
    expect(screen.queryByText("Quero instalar")).not.toBeInTheDocument();
  });

  it("links editorial inspection to an existing specialty instead of translated copy", async () => {
    mockedGetCatalogTechnicians.mockResolvedValue([{ ...items[0], professions: ["Engenheiro Eletricista", "Inspeção técnica"] }]);
    render(
      <MemoryRouter>
        <ProfessionalFeed />
      </MemoryRouter>,
    );
    expect(await screen.findByRole("link", { name: /Encontrar especialistas/ })).toHaveAttribute(
      "href",
      "/pt-BR/buscar/profissionais?specialty=Inspe%C3%A7%C3%A3o%20t%C3%A9cnica",
    );
  });
});
