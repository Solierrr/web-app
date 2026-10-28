import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => null }));
import CompanyProfile from "./CompanyProfile";

vi.mock("@/features/companies/company.service", () => ({
  getCatalogCompanyBySlug: vi.fn(),
}));
vi.mock("@/features/solar-panel/solarPanel.service", () => ({
  getCatalogSolarPanels: vi.fn(),
}));

import { getCatalogCompanyBySlug } from "@/features/companies/company.service";
import type { CatalogCompany } from "@/features/companies/company.service";
import { getCatalogSolarPanels } from "@/features/solar-panel/solarPanel.service";
import type { SolarPanelAnnouncement } from "@/features/solar-panel/solarPanel.announcement";

const mockedGetCompanyBySlug = vi.mocked(getCatalogCompanyBySlug);
const mockedGetCatalogSolarPanels = vi.mocked(getCatalogSolarPanels);

const company: CatalogCompany = {
  id: "company-1",
  city: "São Paulo",
  state: "SP",
  tradeName: "Solaria Energia",
  slug: "solaria-energia",
};

function makeOffer(companySlug: string): SolarPanelAnnouncement {
  return {
    id: "offer-1",
    supplierId: "company-1",
    company: { id: "company-1", tradeName: "Solaria Energia", slug: companySlug },
    panel: {
      id: "model-1",
      brand: "SolarBrand",
      model: "X100",
      type: "MONOCRYSTALLINE" as never,
      powerOutput: 400,
      efficiency: 20,
      dimension: { width: 1, length: 2 },
      weight: 20,
      status: "APPROVED" as never,
    },
    title: "Placa X100",
    description: "",
    photos: { heroImage: { url: "/panel.jpg", description: "" }, otherImages: [] },
    unitPrice: 1000,
    availableUnits: 5,
    serviceRegions: [],
    slug: "placa-x100",
    companySlug,
  };
}

describe("CompanyProfile", () => {
  beforeEach(() => {
    mockedGetCompanyBySlug.mockReset();
    mockedGetCatalogSolarPanels.mockReset();
  });

  it("renders a skeleton while the company is loading", () => {
    mockedGetCompanyBySlug.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <CompanyProfile />
      </MemoryRouter>,
    );

    expect(screen.queryByText("Solaria Energia")).not.toBeInTheDocument();
  });

  it("renders the mocked company once loaded", async () => {
    mockedGetCompanyBySlug.mockResolvedValue(company);
    mockedGetCatalogSolarPanels.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <CompanyProfile />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Solaria Energia" })).toBeInTheDocument();
    expect(screen.getByText("São Paulo, SP")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "entrar em contato" })).toHaveAttribute("href", "/pt-BR/mensagens/empresa/company-1");
  });

  it("shows only the offers belonging to this company", async () => {
    mockedGetCompanyBySlug.mockResolvedValue(company);
    mockedGetCatalogSolarPanels.mockResolvedValue([makeOffer("solaria-energia"), makeOffer("other-company")]);

    render(
      <MemoryRouter>
        <CompanyProfile />
      </MemoryRouter>,
    );

    expect(await screen.findAllByText("Placa X100")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Adicionar Placa X100 ao carrinho" })).toBeEnabled();
    expect(screen.getByText(/1\.000,00/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Placa X100" })).toHaveAttribute("href", "/pt-BR/placa-solar/solaria-energia/placa-x100");
  });
  it("shows the introduction inline and groups infrastructure with products", async () => {
    mockedGetCompanyBySlug.mockResolvedValue({ ...company, description: "Equipamentos e orientação para projetos residenciais." });
    const infrastructure = makeOffer("solaria-energia");
    infrastructure.id = "infra";
    infrastructure.title = "Estrutura para telhado";
    infrastructure.panel.productType = "INFRASTRUCTURE";
    mockedGetCatalogSolarPanels.mockResolvedValue([makeOffer("solaria-energia"), infrastructure]);
    render(
      <MemoryRouter>
        <CompanyProfile />
      </MemoryRouter>,
    );
    expect(await screen.findByText("Equipamentos e orientação para projetos residenciais.")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Todas as ofertas" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Placa X100" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Estrutura para telhado" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Ofertas" })).not.toBeInTheDocument();
  });
});
