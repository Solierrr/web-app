import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@/config/inter/internationalization";
import { ContextMenuProvider } from "@@/overlay/contextMenu/provider/ContextMenuProvider";

vi.mock("@/features/solar-panel/solarPanel.service", () => ({
  getSolarPanelBySlug: vi.fn(),
}));

import { getSolarPanelBySlug } from "@/features/solar-panel/solarPanel.service";
import type { SolarPanelAnnouncement as SolarPanelAnnouncementModel } from "@/features/solar-panel/solarPanelAnnouncement";
import { SolarPanelModelStatus as ModelStatus, SolarPanelType } from "@/features/solar-panel/solarPanel.enum";
import SolarPanelAnnouncement from "./SolarPanelAnnouncement";

const mockedGetSolarPanelBySlug = vi.mocked(getSolarPanelBySlug);

const product: SolarPanelAnnouncementModel = {
  id: "1",
  slug: "coletor-solar-termico-vertical-de-cobre",
  supplierId: "company-1",
  companySlug: "solaria-energia",
  company: { id: "company-1", tradeName: "Solaria Energia", slug: "solaria-energia" },
  panel: { id: "panel-1", status: ModelStatus.APPROVED, brand: "Marca X", type: SolarPanelType.MONOCRYSTALLINE },
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
          <Route path="/placa-solar/:companySlug/:productSlug" element={<SolarPanelAnnouncement />} />
          <Route path="/placa-solar" element={<SolarPanelAnnouncement />} />
        </Routes>
      </MemoryRouter>
    </ContextMenuProvider>,
  );
}

describe("SolarPanelAnnouncement", () => {
  beforeEach(() => {
    mockedGetSolarPanelBySlug.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the error message when there is no company/product slug in the route", () => {
    renderAt("/placa-solar");

    expect(mockedGetSolarPanelBySlug).not.toHaveBeenCalled();
    expect(screen.getByText("Não foi possível carregar o produto.")).toBeInTheDocument();
  });

  it("shows the error message when the service call fails", async () => {
    mockedGetSolarPanelBySlug.mockRejectedValue(new Error("network error"));

    renderAt("/placa-solar/solaria-energia/coletor-solar-termico-vertical-de-cobre");

    expect(await screen.findByText("Não foi possível carregar o produto.")).toBeInTheDocument();
  });

  it("renders the product once it is loaded", async () => {
    mockedGetSolarPanelBySlug.mockResolvedValue(product);

    renderAt("/placa-solar/solaria-energia/coletor-solar-termico-vertical-de-cobre");

    expect(mockedGetSolarPanelBySlug).toHaveBeenCalledWith("solaria-energia", "coletor-solar-termico-vertical-de-cobre");
    expect(await screen.findByText(product.title)).toBeInTheDocument();
    expect(screen.getAllByText("Marca X").length).toBeGreaterThan(0);
    expect(screen.getByText("Anunciado por Solaria Energia")).toBeInTheDocument();
  });

  it("shows brand and type as badges next to the title", async () => {
    mockedGetSolarPanelBySlug.mockResolvedValue(product);

    renderAt("/placa-solar/solaria-energia/coletor-solar-termico-vertical-de-cobre");

    await screen.findByText(product.title);

    expect(screen.getAllByText("Marca X").length).toBe(2);
    expect(screen.getAllByText(SolarPanelType.MONOCRYSTALLINE).length).toBe(2);
  });
});
