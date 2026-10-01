import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import SolarPanelModelCrud from "./SolarPanelModelCrud";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";

vi.mock("@/lib/shared/context/ActiveContext", () => ({ useActiveContext: vi.fn() }));

vi.mock("@/features/solar-panel/solarPanel.service", () => ({
  listSolarPanelModels: vi.fn(),
  createSolarPanel: vi.fn(),
  updateSolarPanel: vi.fn(),
  deleteSolarPanel: vi.fn(),
}));

import { listSolarPanelModels } from "@/features/solar-panel/solarPanel.service";
import { SolarPanelType, SolarPanelModelStatus } from "@/features/solar-panel/solarPanel.enum";
import type { SolarPanel } from "@/features/solar-panel/solarPanel";

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
    vi.mocked(useActiveContext).mockReturnValue({
      loading: false, kind: "company", setKind: vi.fn(), isAdmin: true, hasCompany: true, isPlatformAdmin: false, can: () => true,
      company: { id: "company-1", status: "APPROVED", type: "SUPPLIER", cnpj: "1", tradeName: "Solaria", corporateName: "Solaria Ltda", slug: "solaria" } as never,
    });
  });

  it("renders the page heading and the create form", () => {
    mockedListSolarPanelModels.mockReturnValue(new Promise(() => {}));

    render(<MemoryRouter><SolarPanelModelCrud /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: "Modelos de placa solar" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Marca")).toBeInTheDocument();
  });

  it("renders the mocked models in the table once loaded", async () => {
    mockedListSolarPanelModels.mockResolvedValue(items);

    render(<MemoryRouter><SolarPanelModelCrud /></MemoryRouter>);

    expect(await screen.findByText("SolTech ST-450")).toBeInTheDocument();
  });
});
