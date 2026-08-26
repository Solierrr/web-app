import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import SolarPanelSearch from "./SolarPanelSearch";

vi.mock("@/service/feed/solarPanel.service", () => ({
  getSolarPanels: vi.fn(),
}));

import { getSolarPanels } from "@/service/feed/solarPanel.service";
import type { SolarPanelAnnouncement } from "@/domain/models/announcemnt/solarPanelAnnouncement";
import ModelStatus from "@/domain/enum/modelStatus";

const mockedGetSolarPanels = vi.mocked(getSolarPanels);

const items: SolarPanelAnnouncement[] = [
  {
    id: "1",
    supplierId: "supplier-1",
    panel: { id: "panel-1", status: ModelStatus.Approved },
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

  it("renders the page heading, tabs and filter controls", () => {
    mockedGetSolarPanels.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <SolarPanelSearch />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Placas Solares" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "filtrar-busca" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Vertical")).toBeInTheDocument();
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
    ).toHaveAttribute("href", "/produto/1");
  });
});
