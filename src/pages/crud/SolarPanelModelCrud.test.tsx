import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import SolarPanelModelCrud from "./SolarPanelModelCrud";

vi.mock("@/features/products/solar-panel/solarPanel.service", () => ({
  listSolarPanelModels: vi.fn(),
  createSolarPanel: vi.fn(),
  updateSolarPanel: vi.fn(),
  deleteSolarPanel: vi.fn(),
}));

import { listSolarPanelModels } from "@/features/products/solar-panel/solarPanel.service";
import { SolarPanelType, SolarPanelModelStatus } from "@/features/products/solar-panel/solarPanel.enum";
import type { SolarPanel } from "@/features/products/solar-panel/solarPanel";

const mockedListSolarPanelModels = vi.mocked(listSolarPanelModels);

const items: SolarPanel[] = [
  {
    id: "panel-1",
    brand: "SolTech",
    model: "ST-450",
    type: SolarPanelType.MONOCRYSTALLINE,
    status: SolarPanelModelStatus.APPROVED,
    powerOutput: 450,
  },
];

describe("SolarPanelModelCrud", () => {
  beforeEach(() => {
    mockedListSolarPanelModels.mockReset();
  });

  it("renders the page heading and the create form", () => {
    mockedListSolarPanelModels.mockReturnValue(new Promise(() => {}));

    render(<SolarPanelModelCrud />);

    expect(screen.getByRole("heading", { name: "Modelos de placa solar" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Marca")).toBeInTheDocument();
  });

  it("renders the mocked models in the table once loaded", async () => {
    mockedListSolarPanelModels.mockResolvedValue(items);

    render(<SolarPanelModelCrud />);

    expect(await screen.findByText("SolTech ST-450")).toBeInTheDocument();
  });
});
