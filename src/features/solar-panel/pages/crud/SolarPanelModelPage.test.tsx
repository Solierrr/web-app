vi.mock("@/lib/shared/context/ActiveContext", () => ({ useActiveContext: () => ({ can: () => true, company: { id: "company-1" } }) }));
vi.mock("@/features/solar-panel/solarPanel.photo.service", () => ({
  listModelPhotos: vi.fn().mockResolvedValue([]),
  uploadModelPhoto: vi.fn(),
  deleteModelPhoto: vi.fn(),
}));
vi.mock("@@/layout/access/canvas/SideCanvas", () => ({ default: () => null }));
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listModelPhotos } from "@/features/solar-panel/solarPanel.photo.service";
import SolarPanelModelPage from "./SolarPanelModelPage";
import { listSolarPanelModels } from "@/features/solar-panel/solarPanel.service";
import { SolarPanelModelStatus, SolarPanelType } from "@/features/solar-panel/solarPanel.enum";

vi.mock("@/features/solar-panel/solarPanel.service", () => ({ listSolarPanelModels: vi.fn() }));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/pt-BR/models/panel-1"]}>
      <Routes>
        <Route path="/:lang/models/:modelId" element={<SolarPanelModelPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SolarPanelModelPage", () => {
  beforeEach(() => {
    vi.mocked(listSolarPanelModels).mockReset();
    vi.mocked(listModelPhotos).mockResolvedValue([]);
  });

  it("centers the loading state without showing a detached heading", () => {
    vi.mocked(listSolarPanelModels).mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveClass("min-h-full", "items-center", "justify-center");
  });

  it("groups all specifications and displays a translated status and measurement units", async () => {
    vi.mocked(listSolarPanelModels).mockResolvedValue([
      {
        id: "panel-1",
        brand: "SolTech",
        model: "ST-450",
        type: SolarPanelType.MONOCRYSTALLINE,
        status: SolarPanelModelStatus.APPROVED,
        powerOutput: 450,
        efficiency: 0,
        dimension: { width: 1.2, length: 2.3 },
        weight: 22.5,
      },
    ]);
    renderPage();
    expect(await screen.findByRole("heading", { name: "SolTech ST-450" })).toBeInTheDocument();
    expect(screen.getByText("Aprovada")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Editar modelo" })).not.toBeInTheDocument();
    for (const value of ["450 Wp", "0 %", "1,2 m", "2,3 m", "22,5 kg"]) expect(screen.getByText(value)).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows the main photo first and allows changing the selected gallery image", async () => {
    vi.mocked(listSolarPanelModels).mockResolvedValue([
      {
        id: "panel-1",
        brand: "Solar",
        model: "S450",
        status: SolarPanelModelStatus.APPROVED,
        type: SolarPanelType.MONOCRYSTALLINE,
        powerOutput: 450,
        efficiency: 22,
        weight: 20,
        dimension: { width: 1, length: 2 },
      },
    ]);
    vi.mocked(listModelPhotos).mockResolvedValue([
      { id: "gallery", url: "/gallery.png", primary: false },
      { id: "main", url: "/main.png", primary: true },
    ] as Awaited<ReturnType<typeof listModelPhotos>>);
    renderPage();
    await screen.findByRole("heading", { name: "Solar S450" });
    expect(screen.getByRole("img", { name: "Solar S450" })).toHaveAttribute("src", "/main.png");
    fireEvent.click(screen.getByRole("button", { name: /2/ }));
    expect(screen.getByRole("img", { name: "Solar S450" })).toHaveAttribute("src", "/gallery.png");
  });
  it("shows an error with navigation back when the model is missing", async () => {
    vi.mocked(listSolarPanelModels).mockResolvedValue([]);
    renderPage();
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar à lista" })).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
