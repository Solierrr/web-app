import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import RegistrationsPage from "./RegistrationsPage";
import type { Company } from "@/features/companies/company";
import { approveCompany, listAllCompanies } from "@/features/companies/company.service";
import type { SolarPanel } from "@/features/solar-panel/solarPanel";
import { listSolarPanelModelsByStatus, rejectSolarPanel } from "@/features/solar-panel/solarPanel.service";
import { listProfessionalReviews } from "@/features/professionals/review/review.service";

vi.mock("@/features/companies/company.service", () => ({
  listAllCompanies: vi.fn(),
  approveCompany: vi.fn(),
  rejectCompany: vi.fn(),
}));

vi.mock("@/features/solar-panel/solarPanel.service", () => ({
  listSolarPanelModelsByStatus: vi.fn(),
  approveSolarPanel: vi.fn(),
  rejectSolarPanel: vi.fn(),
}));

vi.mock("@/features/professionals/review/review.service", () => ({
  listProfessionalReviews: vi.fn(),
  decideProfessional: vi.fn(),
}));

const pendingCompany = {
  id: "company-1", status: "UNDER_ANALYSIS", type: "SUPPLIER",
  cnpj: "12345678000199", tradeName: "Fornecedora Solar", corporateName: "Fornecedora Solar Ltda", slug: "fornecedora-solar",
} as unknown as Company;

const approvedCompany = {
  id: "company-2", status: "APPROVED", type: "SUPPLIER",
  cnpj: "98765432000188", tradeName: "Já Aprovada", corporateName: "Já Aprovada Ltda", slug: "ja-aprovada",
} as unknown as Company;

const pendingModel = {
  id: "model-1", brand: "Marca", model: "Modelo X", status: "UNDER_ANALYSIS", powerOutput: 550,
} as unknown as SolarPanel;

describe("RegistrationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listProfessionalReviews).mockResolvedValue([]);
  });

  it("lists only companies under analysis, and pending models", async () => {
    vi.mocked(listAllCompanies).mockResolvedValue([pendingCompany, approvedCompany]);
    vi.mocked(listSolarPanelModelsByStatus).mockResolvedValue([pendingModel]);

    render(<MemoryRouter><RegistrationsPage /></MemoryRouter>);

    expect(await screen.findByText("Fornecedora Solar")).toBeInTheDocument();
    expect(screen.queryByText("Já Aprovada")).not.toBeInTheDocument();
    expect(screen.getByText("Marca Modelo X")).toBeInTheDocument();
  });

  it("approves a pending company and reloads the queue", async () => {
    vi.mocked(listAllCompanies).mockResolvedValue([pendingCompany]);
    vi.mocked(listSolarPanelModelsByStatus).mockResolvedValue([]);
    vi.mocked(approveCompany).mockResolvedValue({ ...pendingCompany, status: "APPROVED" } as never);

    render(<MemoryRouter><RegistrationsPage /></MemoryRouter>);
    await screen.findByText("Fornecedora Solar");

    screen.getAllByRole("button", { name: "Aprovar" })[0].click();

    await waitFor(() => expect(approveCompany).toHaveBeenCalledWith("company-1"));
    expect(listAllCompanies).toHaveBeenCalledTimes(2);
  });

  it("rejects a pending model and reloads the queue", async () => {
    vi.mocked(listAllCompanies).mockResolvedValue([]);
    vi.mocked(listSolarPanelModelsByStatus).mockResolvedValue([pendingModel]);
    vi.mocked(rejectSolarPanel).mockResolvedValue({ ...pendingModel, status: "REJECTED" } as never);

    render(<MemoryRouter><RegistrationsPage /></MemoryRouter>);
    await screen.findByText("Marca Modelo X");

    screen.getAllByRole("button", { name: "Rejeitar" })[0].click();

    await waitFor(() => expect(rejectSolarPanel).toHaveBeenCalledWith("model-1"));
    expect(listSolarPanelModelsByStatus).toHaveBeenCalledTimes(2);
  });

  it("shows the empty states when there is nothing pending", async () => {
    vi.mocked(listAllCompanies).mockResolvedValue([]);
    vi.mocked(listSolarPanelModelsByStatus).mockResolvedValue([]);

    render(<MemoryRouter><RegistrationsPage /></MemoryRouter>);

    expect(await screen.findByText("Nenhuma empresa pendente.")).toBeInTheDocument();
    expect(screen.getByText("Nenhum modelo pendente.")).toBeInTheDocument();
  });

  it("shows a load error when the queue fails to fetch", async () => {
    vi.mocked(listAllCompanies).mockRejectedValue(new Error("network"));
    vi.mocked(listSolarPanelModelsByStatus).mockResolvedValue([]);

    render(<MemoryRouter><RegistrationsPage /></MemoryRouter>);

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar os cadastros pendentes.");
  });
});
