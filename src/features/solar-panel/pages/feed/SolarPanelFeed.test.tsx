import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import SolarPanelFeed from "./SolarPanelFeed";

vi.mock("@/features/solar-panel/solarPanel.service", () => ({
  getCatalogSolarPanels: vi.fn(),
}));

import { getCatalogSolarPanels } from "@/features/solar-panel/solarPanel.service";
import type { SolarPanelAnnouncement } from "@/features/solar-panel/solarPanel.announcement";
import { SolarPanelModelStatus as ModelStatus } from "@/features/solar-panel/solarPanel.enum";

const mockedGetSolarPanels = vi.mocked(getCatalogSolarPanels);

const offer: SolarPanelAnnouncement = {
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
};

const items: SolarPanelAnnouncement[] = Array.from({ length: 3 }, (_, index) => ({
  ...offer,
  id: String(index + 1),
  slug: `${offer.slug}-${index + 1}`,
  title: `${offer.title} ${index + 1}`,
}));

describe("SolarPanelFeed", () => {
  beforeEach(() => {
    mockedGetSolarPanels.mockReset();
  });

  it("shows the empty state when there are no offers", async () => {
    mockedGetSolarPanels.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <SolarPanelFeed />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Ainda não há ofertas disponíveis nesta categoria.")).toBeInTheDocument();
  });

  it("renders the mocked solar panels inside the feed shelves", async () => {
    mockedGetSolarPanels.mockResolvedValue(items);

    render(
      <MemoryRouter>
        <SolarPanelFeed />
      </MemoryRouter>,
    );

    expect((await screen.findAllByText("Coletor Solar Térmico Vertical De Cobre 1")).length).toBeGreaterThan(0);
  });
});
