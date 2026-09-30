import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import SolarPanelSearch from "./SolarPanelSearch";

vi.mock("@/features/solar-panel/solarPanel.service", () => ({
  getCatalogSolarPanels: vi.fn(),
}));

import { getCatalogSolarPanels } from "@/features/solar-panel/solarPanel.service";
import type { SolarPanelAnnouncement } from "@/features/solar-panel/solarPanelAnnouncement";
import { SolarPanelModelStatus as ModelStatus } from "@/features/solar-panel/solarPanel.enum";

const mockedGetSolarPanels = vi.mocked(getCatalogSolarPanels);

const items: SolarPanelAnnouncement[] = [
  {
    id: "1",
    slug: "coletor-solar-termico-vertical-de-cobre",
    companySlug: "solaria-energia",
    supplierId: "company-1",
    company: { id: "company-1", tradeName: "Solaria Energia", slug: "solaria-energia" },
    panel: { id: "panel-1", status: ModelStatus.APPROVED },
    title: "Coletor Solar Térmico Vertical De Cobre",
    description: "Descrição",
    unitPrice: 200,
    availableUnits: 10,
    serviceRegions: [],
    photos: {
      heroImage: {
        description: "Placa solar",
        url: "https://example.com/1.png",
      },
      otherImages: [],
    },
  },
];

describe("SolarPanelSearch", () => {
  beforeEach(() => {
    mockedGetSolarPanels.mockReset();
  });

  it("renders the page heading and search field", async () => {
    mockedGetSolarPanels.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <SolarPanelSearch />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Placas Solares" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Buscar placa solar" })).toBeInTheDocument();
  });

  it("renders the mocked solar panels in the results grid", async () => {
    mockedGetSolarPanels.mockResolvedValue(items);

    render(
      <MemoryRouter>
        <SolarPanelSearch />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("link", {
        name: /Coletor Solar Térmico Vertical De Cobre/,
      }),
    ).toHaveAttribute("href", "/pt-BR/placa-solar/solaria-energia/coletor-solar-termico-vertical-de-cobre");
  });
});
