import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ProfessionalProfile from "./ProfessionalProfile";
import Auth from "@/features/access/auth/Auth";
import { AuthContext } from "@/features/access/auth/Auth.utils";

vi.mock("@/features/professionals/professional.service", () => ({
  getProfessionalBySlug: vi.fn(),
}));

import { getProfessionalBySlug } from "@/features/professionals/professional.service";
import type { Professional } from "@/features/professionals/professional";

function renderAuthenticated(ui: React.ReactNode) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{ authenticated: true, access: { id: "1", name: "Você", email: "you@inter.com" }, login: vi.fn(), logout: vi.fn() }}>
        {ui}
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

const mockedGetProfessionalBySlug = vi.mocked(getProfessionalBySlug);

const professional: Professional = {
  id: "professional-1",
  name: "Carlos Eduardo Lima",
  contact: { number: "31991112222", email: "carlos.lima@gmail.com" },
  address: {
    street: "Rua das Palmeiras",
    number: "220",
    neighborhood: "Savassi",
    city: "Belo Horizonte",
    state: "MG",
    country: "Brasil",
    zipCode: "30130-000",
  },
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
        <Auth>
          <ProfessionalProfile />
        </Auth>
      </MemoryRouter>,
    );

    expect(screen.queryByText("Carlos Eduardo Lima")).not.toBeInTheDocument();
  });

  it("renders the mocked professional once loaded", async () => {
    mockedGetProfessionalBySlug.mockResolvedValue(professional);

    render(
      <MemoryRouter>
        <Auth>
          <ProfessionalProfile />
        </Auth>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Carlos Eduardo Lima" })).toBeInTheDocument();
    expect(screen.getByText("Belo Horizonte/MG")).toBeInTheDocument();
  });

  it("hides the contact action when the visitor is not authenticated", async () => {
    mockedGetProfessionalBySlug.mockResolvedValue(professional);

    render(
      <MemoryRouter>
        <Auth>
          <ProfessionalProfile />
        </Auth>
      </MemoryRouter>,
    );

    await screen.findByRole("heading", { name: "Carlos Eduardo Lima" });

    expect(screen.queryByRole("link", { name: /contato/i })).not.toBeInTheDocument();
  });

  it("shows the contact action when the visitor is authenticated", async () => {
    mockedGetProfessionalBySlug.mockResolvedValue(professional);

    renderAuthenticated(<ProfessionalProfile />);

    expect(await screen.findByRole("link", { name: /contato/i })).toBeInTheDocument();
  });
});
