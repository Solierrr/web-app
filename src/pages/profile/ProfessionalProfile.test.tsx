import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ProfessionalProfile from "./ProfessionalProfile";

vi.mock("@/features/professionals/professional.service", () => ({
  getProfessionalBySlug: vi.fn(),
}));

import { getProfessionalBySlug } from "@/features/professionals/professional.service";
import type { Professional } from "@/features/professionals/professional";

const mockedGetProfessionalBySlug = vi.mocked(getProfessionalBySlug);

const professional: Professional = {
  id: "professional-1",
  name: "Carlos Eduardo Lima",
  contact: { number: "31991112222", email: "carlos.lima@gmail.com" },
  address: { street: "Rua das Palmeiras", number: "220", neighborhood: "Savassi", city: "Belo Horizonte", state: "MG", country: "Brasil", zipCode: "30130-000" },
  geolocation: { latitude: 0, longitude: 0 },
  registrations: [{ profession: "Engenheiro Eletricista", council: "CREA-MG", number: "123456", expirationDate: "2027-01-01" }],
  slug: "carlos-eduardo-lima",
};

describe("ProfessionalProfile", () => {
  beforeEach(() => {
    mockedGetProfessionalBySlug.mockReset();
  });

  it("renders a skeleton while the professional is loading", () => {
    mockedGetProfessionalBySlug.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <ProfessionalProfile />
      </MemoryRouter>,
    );

    expect(screen.queryByText("Carlos Eduardo Lima")).not.toBeInTheDocument();
  });

  it("renders the mocked professional once loaded", async () => {
    mockedGetProfessionalBySlug.mockResolvedValue(professional);

    render(
      <MemoryRouter>
        <ProfessionalProfile />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Carlos Eduardo Lima" })).toBeInTheDocument();
    expect(screen.getByText("Belo Horizonte/MG")).toBeInTheDocument();
  });
});
