vi.mock("@@/layout/access/canvas/SideCanvas", () => ({ default: () => null }));
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AnalyticsPage from "./AnalyticsPage";
import { expectNoA11yViolations } from "@/lib/shared/accessibility/accessibility.matchers";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { getCompanyDashboard, getPlatformDashboard } from "../analytics.service";
import { getAnalyticsDashboardMock } from "../analytics.d.mocks";
import { listAllCompanies } from "@/features/companies/company.service";

vi.mock("@/lib/shared/context/ActiveContext", () => ({ useActiveContext: vi.fn() }));
vi.mock("../analytics.service", () => ({ getPlatformDashboard: vi.fn(), getCompanyDashboard: vi.fn() }));
vi.mock("@/features/companies/company.service", () => ({ listAllCompanies: vi.fn() }));

const base = { loading: false, setKind: vi.fn(), hasCompany: false, isAdmin: true };
const supplier = { id: "c1", type: "SUPPLIER", tradeName: "Solar XPTO" } as never;

describe("AnalyticsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listAllCompanies).mockResolvedValue([]);
  });

  it("shows the platform dashboard for a Elos admin", async () => {
    vi.mocked(useActiveContext).mockReturnValue({ ...base, kind: "personal", company: null, isPlatformAdmin: true });
    vi.mocked(getPlatformDashboard).mockResolvedValue(getAnalyticsDashboardMock("PLATFORM"));

    render(<AnalyticsPage />);

    expect(await screen.findByText("Fornecedores ativos")).toBeInTheDocument();
    expect(screen.getByText("Visão de toda a plataforma")).toBeInTheDocument();
    expect(getCompanyDashboard).not.toHaveBeenCalled();
  });

  it("has no accessibility violations", async () => {
    vi.mocked(useActiveContext).mockReturnValue({ ...base, kind: "personal", company: null, isPlatformAdmin: true });
    vi.mocked(getPlatformDashboard).mockResolvedValue(getAnalyticsDashboardMock("PLATFORM"));
    const { container } = render(<AnalyticsPage />);
    await screen.findByText("Fornecedores ativos");

    await expectNoA11yViolations(container);
  }, 30000);

  it("shows only the active company dashboard for a company admin", async () => {
    vi.mocked(useActiveContext).mockReturnValue({ ...base, kind: "company", company: supplier, isPlatformAdmin: false, can: () => true });
    vi.mocked(getCompanyDashboard).mockResolvedValue(getAnalyticsDashboardMock("SUPPLIER", "c1"));

    render(<AnalyticsPage />);

    expect(await screen.findByText("Ofertas ativas")).toBeInTheDocument();
    expect(getCompanyDashboard).toHaveBeenCalledWith("c1", "SUPPLIER");
    expect(getPlatformDashboard).not.toHaveBeenCalled();
    expect(listAllCompanies).not.toHaveBeenCalled();
    expect(screen.queryByText("Visão da plataforma")).not.toBeInTheDocument();
  });

  it("explains the personal scope without calling any service", () => {
    vi.mocked(useActiveContext).mockReturnValue({ ...base, kind: "personal", company: null, isPlatformAdmin: false });

    render(<AnalyticsPage />);

    expect(screen.getByText(/Os indicadores aparecem quando você atua/)).toBeInTheDocument();
    expect(getPlatformDashboard).not.toHaveBeenCalled();
    expect(getCompanyDashboard).not.toHaveBeenCalled();
  });

  it("shows an error when the dashboard cannot be loaded", async () => {
    vi.mocked(useActiveContext).mockReturnValue({ ...base, kind: "personal", company: null, isPlatformAdmin: true });
    vi.mocked(getPlatformDashboard).mockRejectedValue(new Error("boom"));

    render(<AnalyticsPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar os indicadores.");
  });

  it("exports the metrics as a CSV", async () => {
    vi.mocked(useActiveContext).mockReturnValue({ ...base, kind: "company", company: supplier, isPlatformAdmin: false, can: () => true });
    vi.mocked(getCompanyDashboard).mockResolvedValue(getAnalyticsDashboardMock("SUPPLIER", "c1"));
    const createObjectURL = vi.fn(() => "blob:csv");
    Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() });

    render(<AnalyticsPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Exportar CSV" }));

    await waitFor(() => expect(createObjectURL).toHaveBeenCalled());
  });
});
