import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@/config/locales/internationalization";
import { ContextMenuProvider } from "@@/overlay/contextMenu/provider/ContextMenuProvider";

vi.mock("@/features/products/solar-panel/solarPanel.service", () => ({
  getSolarPanel: vi.fn(),
}));

import { getSolarPanel } from "@/features/products/solar-panel/solarPanel.service";
import type { SolarPanelAnnouncement as SolarPanelAnnouncementModel } from "@/features/products/solar-panel/solarPanelAnnouncement";
import { SolarPanelModelStatus as ModelStatus } from "@/features/products/solar-panel/solarPanel.enum";
import SolarPanelAnnouncement from "./SolarPanelAnnouncement";

const mockedGetSolarPanel = vi.mocked(getSolarPanel);

const product: SolarPanelAnnouncementModel = {
  id: "1",
  supplierId: "supplier-1",
  panel: { id: "panel-1", status: ModelStatus.Approved, brand: "Marca X" },
  title: "Coletor Solar Térmico Vertical De Cobre",
  description: "Descrição do produto",
  unitPrice: 200,
  availableUnits: 10,
  serviceRegions: ["São Paulo"],
  photos: {
    heroImage: { description: "Placa solar", url: "https://example.com/1.png" },
    otherImages: [],
  },
};

function renderAt(path: string) {
  return render(
    <ContextMenuProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/produto/:id" element={<SolarPanelAnnouncement />} />
          <Route path="/produto" element={<SolarPanelAnnouncement />} />
        </Routes>
      </MemoryRouter>
    </ContextMenuProvider>,
  );
}

describe("SolarPanelAnnouncement", () => {
  beforeEach(() => {
    mockedGetSolarPanel.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the error message when there is no id in the route", () => {
    renderAt("/produto");

    expect(mockedGetSolarPanel).not.toHaveBeenCalled();
    expect(
      screen.getByText("Não foi possível carregar o produto."),
    ).toBeInTheDocument();
  });

  it("shows the error message when the service call fails", async () => {
    mockedGetSolarPanel.mockRejectedValue(new Error("network error"));

    renderAt("/produto/1");

    expect(
      await screen.findByText("Não foi possível carregar o produto."),
    ).toBeInTheDocument();
  });

  it("renders the product once it is loaded", async () => {
    mockedGetSolarPanel.mockResolvedValue(product);

    renderAt("/produto/1");

    expect(mockedGetSolarPanel).toHaveBeenCalledWith("1");
    expect(await screen.findByText(product.title)).toBeInTheDocument();
    expect(screen.getByText("Marca X")).toBeInTheDocument();
  });
});
