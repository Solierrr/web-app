import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AnalyticsPage from "./AnalyticsPage";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { getCompanyKpis, getPlatformKpis } from "../analytics.service";

vi.mock("@/lib/shared/context/ActiveContext", () => ({ useActiveContext: vi.fn() }));
vi.mock("../analytics.service", () => ({ getPlatformKpis: vi.fn(), getCompanyKpis: vi.fn() }));

const base = { loading: false, setKind: vi.fn(), hasCompany: false, isAdmin: true };
function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(blob);
  });
}

const supplier = { id: "c1", type: "SUPPLIER", tradeName: "Solar XPTO" } as never;

describe("AnalyticsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the platform indicators for a Solaria admin", async () => {
    vi.mocked(useActiveContext).mockReturnValue({ ...base, kind: "personal", company: null, isPlatformAdmin: true });
    vi.mocked(getPlatformKpis).mockResolvedValue({
      failed: false,
      kpis: [
        { key: "approvedCompanies", value: 4 },
        { key: "pendingModels", value: 2 },
      ],
    });

    render(<AnalyticsPage />);

    expect(await screen.findByText("Empresas aprovadas")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Modelos em análise")).toBeInTheDocument();
    expect(screen.getByText("Visão de toda a plataforma")).toBeInTheDocument();
    expect(getCompanyKpis).not.toHaveBeenCalled();
  });

  it("shows the company indicators for the active company", async () => {
    vi.mocked(useActiveContext).mockReturnValue({ ...base, kind: "company", company: supplier, isPlatformAdmin: false, can: () => true });
    vi.mocked(getCompanyKpis).mockResolvedValue({ failed: false, kpis: [{ key: "activeOffers", value: 7 }] });

    render(<AnalyticsPage />);

    expect(await screen.findByText("Ofertas ativas")).toBeInTheDocument();
    expect(getCompanyKpis).toHaveBeenCalledWith(supplier, expect.any(Function));
    expect(getPlatformKpis).not.toHaveBeenCalled();
  });

  it("explains the personal scope without calling any service", () => {
    vi.mocked(useActiveContext).mockReturnValue({ ...base, kind: "personal", company: null, isPlatformAdmin: false });

    render(<AnalyticsPage />);

    expect(screen.getByText(/Os indicadores aparecem quando você atua em uma empresa/)).toBeInTheDocument();
    expect(getPlatformKpis).not.toHaveBeenCalled();
  });

  it("warns about partial data and about total failure", async () => {
    vi.mocked(useActiveContext).mockReturnValue({ ...base, kind: "personal", company: null, isPlatformAdmin: true });
    vi.mocked(getPlatformKpis).mockResolvedValueOnce({ failed: true, kpis: [{ key: "approvedCompanies", value: 1 }] });
    const { unmount } = render(<AnalyticsPage />);
    expect(await screen.findByText("Alguns indicadores não puderam ser carregados.")).toBeInTheDocument();
    unmount();

    vi.mocked(getPlatformKpis).mockRejectedValueOnce(new Error("offline"));
    render(<AnalyticsPage />);
    expect(await screen.findByText("Não foi possível carregar os indicadores.")).toBeInTheDocument();
  });

  it("exports the shown indicators as a csv file", async () => {
    vi.mocked(useActiveContext).mockReturnValue({ ...base, kind: "personal", company: null, isPlatformAdmin: true });
    vi.mocked(getPlatformKpis).mockResolvedValue({ failed: false, kpis: [{ key: "approvedCompanies", value: 4 }] });
    const createObjectURL = vi.fn(() => "blob:csv");
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    render(<AnalyticsPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Exportar CSV" }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(await readBlob((createObjectURL.mock.calls[0] as unknown as [Blob])[0])).toBe("indicador,valor\nEmpresas aprovadas,4");
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:csv");
    click.mockRestore();
  });
});
