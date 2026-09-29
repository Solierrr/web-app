import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DashboardPage from "./DashboardPage";
import { useActiveContext } from "@/shared/context/ActiveContext";
import { getCatalogSolarPanels } from "@/features/solar-panel/solarPanel.service";

vi.mock("@/shared/context/ActiveContext", () => ({ useActiveContext: vi.fn() }));
vi.mock("@/features/solar-panel/solarPanel.service", () => ({ getCatalogSolarPanels: vi.fn() }));

describe("DashboardPage", () => {
  it("shows a loading state", () => {
    vi.mocked(useActiveContext).mockReturnValue({ loading: true, kind: "personal", setKind: vi.fn(), company: null, isAdmin: false, hasCompany: false, isPlatformAdmin: false });

    render(<DashboardPage />);

    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("shows the personal hint when there is no company", () => {
    vi.mocked(useActiveContext).mockReturnValue({ loading: false, kind: "personal", setKind: vi.fn(), company: null, isAdmin: false, hasCompany: false, isPlatformAdmin: false });

    render(<DashboardPage />);

    expect(screen.getByText("Olá!")).toBeInTheDocument();
    expect(screen.getByText(/Use o menu/)).toBeInTheDocument();
  });

  it("shows the offer count for a supplier company", async () => {
    vi.mocked(useActiveContext).mockReturnValue({
      loading: false, kind: "company", setKind: vi.fn(), isAdmin: true, hasCompany: true, isPlatformAdmin: false,
      company: { id: "c1", status: "APPROVED", type: "SUPPLIER", cnpj: "1", tradeName: "Solaria", corporateName: "Solaria Ltda", slug: "solaria" } as never,
    });
    vi.mocked(getCatalogSolarPanels).mockResolvedValue([
      { companySlug: "solaria" } as never,
      { companySlug: "other" } as never,
    ]);

    render(<DashboardPage />);

    expect(screen.getByText("Olá, Solaria")).toBeInTheDocument();
    expect(await screen.findByText("1")).toBeInTheDocument();
  });

  it("shows the more-metrics-soon note for a demandant company", () => {
    vi.mocked(useActiveContext).mockReturnValue({
      loading: false, kind: "company", setKind: vi.fn(), isAdmin: true, hasCompany: true, isPlatformAdmin: false,
      company: { id: "c1", status: "APPROVED", type: "DEMANDANT", cnpj: "1", tradeName: "Solaria", corporateName: "Solaria Ltda", slug: "solaria" } as never,
    });

    render(<DashboardPage />);

    expect(screen.getByText(/Mais métricas/)).toBeInTheDocument();
  });
});
