import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import SolarPanelFeed from "./SolarPanelFeed";

vi.mock("@/features/solar-panel/solarPanel.service", () => ({
  getSolarPanels: vi.fn(),
}));

import { getSolarPanels } from "@/features/solar-panel/solarPanel.service";
import type { SolarPanelAnnouncement, SolarPanelFeedSummary } from "@/features/solar-panel/solarPanelAnnouncement";

const mockedGetSolarPanels = vi.mocked(getSolarPanels);

// A service resolve `SolarPanelAnnouncement[]` completo, mas o feed só usa o
// subconjunto `SolarPanelFeedSummary` — os fixtures abaixo só precisam desse
// subconjunto.
function mockFeedItems(items: SolarPanelFeedSummary[]) {
  mockedGetSolarPanels.mockResolvedValue(items as SolarPanelAnnouncement[]);
}

function summary(overrides: Partial<SolarPanelFeedSummary>): SolarPanelFeedSummary {
  return {
    id: overrides.id ?? "1",
    slug: overrides.slug ?? "produto",
    companySlug: "solaria-energia",
    title: overrides.title ?? "Produto",
    unitPrice: 200,
    photos: { heroImage: { description: "Placa solar", url: "https://example.com/1.png" }, otherImages: [] },
    ...overrides,
  };
}

describe("SolarPanelFeed", () => {
  beforeEach(() => {
    mockedGetSolarPanels.mockReset();
  });

  it("renders the page heading and tabs", async () => {
    mockFeedItems([]);

    render(
      <MemoryRouter>
        <SolarPanelFeed />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Placas Solares" })).toBeInTheDocument();
    expect(screen.getByText("Serviços")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Empresas" })).toBeInTheDocument();
  });

  it("only renders the best sellers and new arrivals corridors when nothing is on sale", async () => {
    const items = [
      summary({ id: "1", title: "Placa Mais Vendida", soldUnits: 100 }),
      summary({ id: "2", title: "Placa Pouco Vendida", soldUnits: 1 }),
    ];
    mockFeedItems(items);

    render(
      <MemoryRouter>
        <SolarPanelFeed />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Mais vendidos")).toBeInTheDocument();
    expect(screen.getByText("Novidades")).toBeInTheDocument();
    expect(screen.queryByText("Em oferta")).not.toBeInTheDocument();
  });

  it("renders the on-sale corridor only for items with a discount", async () => {
    const items = [summary({ id: "1", title: "Placa Sem Desconto" }), summary({ id: "2", title: "Placa Com Desconto", discountPercentage: 15 })];
    mockFeedItems(items);

    render(
      <MemoryRouter>
        <SolarPanelFeed />
      </MemoryRouter>,
    );

    await screen.findByText("Mais vendidos");

    expect(screen.getByText("Em oferta")).toBeInTheDocument();
    expect(screen.getAllByText("Placa Com Desconto").length).toBeGreaterThan(0);
  });
});
