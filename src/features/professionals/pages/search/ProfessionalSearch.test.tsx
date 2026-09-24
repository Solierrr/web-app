import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ProfessionalSearch from "./ProfessionalSearch";

vi.mock("@/features/professionals/professional.service", () => ({
  getProfessionals: vi.fn(),
}));

import { getProfessionals } from "@/features/professionals/professional.service";
import type { Professional } from "@/features/professionals/professional";

const mockedGetProfessionals = vi.mocked(getProfessionals);

const items: Professional[] = [
  {
    id: "professional-1",
    name: "Carlos Eduardo Lima",
    contact: { number: "31991112222", email: "carlos.lima@gmail.com" },
    address: { street: "Rua das Palmeiras", number: "220", neighborhood: "Savassi", city: "Belo Horizonte", state: "MG", country: "Brasil", zipCode: "30130-000" },
    geolocation: { latitude: 0, longitude: 0 },
    slug: "carlos-eduardo-lima",
  },
];

describe("ProfessionalSearch", () => {
  beforeEach(() => {
    mockedGetProfessionals.mockReset();
  });

  it("renders the page heading and filter controls", () => {
    mockedGetProfessionals.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <ProfessionalSearch />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Profissionais" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "filtrar-busca" })).toBeInTheDocument();
    expect(screen.getByText("Instalação")).toBeInTheDocument();
  });

  it("renders the mocked professionals in the results grid", async () => {
    mockedGetProfessionals.mockResolvedValue(items);

    render(
      <MemoryRouter>
        <ProfessionalSearch />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Carlos Eduardo Lima")).toBeInTheDocument();
  });
});
