import { SidePanelProvider } from "@@/layout/side-panel/SidePanel.provider";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

vi.mock("@@/layout/access/canvas/SideCanvas", () => ({ default: () => <div data-testid="side-canvas" /> }));

const pendingCompany = {
  id: "company-1",
  status: "UNDER_ANALYSIS",
  type: "SUPPLIER",
  cnpj: "12345678000199",
  tradeName: "Fornecedora Solar",
  corporateName: "Fornecedora Solar Ltda",
  slug: "fornecedora-solar",
} as unknown as Company;

const approvedCompany = {
  id: "company-2",
  status: "APPROVED",
  type: "SUPPLIER",
  cnpj: "98765432000188",
  tradeName: "Já Aprovada",
  corporateName: "Já Aprovada Ltda",
  slug: "ja-aprovada",
} as unknown as Company;

const pendingModel = {
  id: "model-1",
  brand: "Marca",
  model: "Modelo X",
  status: "UNDER_ANALYSIS",
  powerOutput: 550,
} as unknown as SolarPanel;

describe("RegistrationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listProfessionalReviews).mockResolvedValue([]);
  });

  it("lists only companies under analysis, and pending models", async () => {
    vi.mocked(listAllCompanies).mockResolvedValue([pendingCompany, approvedCompany]);
    vi.mocked(listSolarPanelModelsByStatus).mockResolvedValue([pendingModel]);

    render(
      <MemoryRouter>
        <SidePanelProvider>
          <RegistrationsPage />
        </SidePanelProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Fornecedora Solar")).toBeInTheDocument();
    expect(screen.queryByText("Já Aprovada")).not.toBeInTheDocument();
    expect(screen.queryByText("Marca Modelo X")).not.toBeInTheDocument();
    expect(screen.getAllByRole("table")).toHaveLength(1);
    fireEvent.click(screen.getByRole("link", { name: "Placas solares" }));
    expect(screen.getByText("Marca Modelo X")).toBeInTheDocument();
    expect(screen.queryByText("Fornecedora Solar")).not.toBeInTheDocument();
  });

  it("approves a pending company and reloads the queue", async () => {
    vi.mocked(listAllCompanies).mockResolvedValue([pendingCompany]);
    vi.mocked(listSolarPanelModelsByStatus).mockResolvedValue([]);
    vi.mocked(approveCompany).mockResolvedValue({ ...pendingCompany, status: "APPROVED" } as never);

    render(
      <MemoryRouter>
        <SidePanelProvider>
          <RegistrationsPage />
        </SidePanelProvider>
      </MemoryRouter>,
    );
    await screen.findByText("Fornecedora Solar");

    fireEvent.click(screen.getAllByRole("button", { name: /Opções do registro/ })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Aprovar" })[0]);
    expect(approveCompany).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "confirmar" }));

    await waitFor(() => expect(approveCompany).toHaveBeenCalledWith("company-1"));
    expect(listAllCompanies).toHaveBeenCalledTimes(2);
  });

  it("rejects a pending model and reloads the queue", async () => {
    vi.mocked(listAllCompanies).mockResolvedValue([]);
    vi.mocked(listSolarPanelModelsByStatus).mockResolvedValue([pendingModel]);
    vi.mocked(rejectSolarPanel).mockResolvedValue({ ...pendingModel, status: "REJECTED" } as never);

    render(
      <MemoryRouter>
        <SidePanelProvider>
          <RegistrationsPage />
        </SidePanelProvider>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("link", { name: "Placas solares" }));
    await screen.findByText("Marca Modelo X");

    fireEvent.click(screen.getAllByRole("button", { name: /Opções do registro/ })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Rejeitar" })[0]);
    expect(rejectSolarPanel).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "confirmar" }));

    await waitFor(() => expect(rejectSolarPanel).toHaveBeenCalledWith("model-1"));
    expect(listSolarPanelModelsByStatus).toHaveBeenCalledTimes(2);
  });

  it("shows the empty states when there is nothing pending", async () => {
    vi.mocked(listAllCompanies).mockResolvedValue([]);
    vi.mocked(listSolarPanelModelsByStatus).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <SidePanelProvider>
          <RegistrationsPage />
        </SidePanelProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Nenhuma empresa pendente.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Placas solares" }));
    expect(screen.getByText("Nenhum modelo pendente.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Profissionais" }));
    expect(screen.getByText("Nenhum profissional aguardando an\u00e1lise.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Tipo:/ })).not.toBeInTheDocument();
  });

  it("shows a load error when the queue fails to fetch", async () => {
    vi.mocked(listAllCompanies).mockRejectedValue(new Error("network"));
    vi.mocked(listSolarPanelModelsByStatus).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <SidePanelProvider>
          <RegistrationsPage />
        </SidePanelProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar os cadastros pendentes.");
  });

  it("shows every situation when the status filter is cleared and links to the detail", async () => {
    vi.mocked(listAllCompanies).mockResolvedValue([pendingCompany, approvedCompany]);
    vi.mocked(listSolarPanelModelsByStatus).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <SidePanelProvider>
          <RegistrationsPage />
        </SidePanelProvider>
      </MemoryRouter>,
    );
    await screen.findByText("Fornecedora Solar");

    fireEvent.click(screen.getByRole("button", { name: /^Situa\u00e7\u00e3o:/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Todos" }));

    expect(screen.getByText("Já Aprovada")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Já Aprovada" })).toHaveAttribute("href", "/pt-BR/admin/cadastros/company/company-2");
    fireEvent.click(screen.getAllByRole("button", { name: /Opções do registro/ })[0]);
    expect(screen.getAllByRole("button", { name: "Aprovar" })).toHaveLength(1);
  });

  it("filters by registration type", async () => {
    vi.mocked(listAllCompanies).mockResolvedValue([
      pendingCompany,
      { ...pendingCompany, id: "company-3", type: "DEMANDANT", tradeName: "Demandante Sul" } as unknown as Company,
    ]);
    vi.mocked(listSolarPanelModelsByStatus).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <SidePanelProvider>
          <RegistrationsPage />
        </SidePanelProvider>
      </MemoryRouter>,
    );
    await screen.findByText("Fornecedora Solar");

    fireEvent.click(screen.getByRole("button", { name: /^Tipo:/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Demandantes" }));

    expect(screen.getByText("Demandante Sul")).toBeInTheDocument();
    expect(screen.queryByText("Fornecedora Solar")).not.toBeInTheDocument();
  });
  it("keeps headers and disabled row menus visible while loading", () => {
    vi.mocked(listAllCompanies).mockReturnValue(new Promise(() => {}));
    vi.mocked(listSolarPanelModelsByStatus).mockReturnValue(new Promise(() => {}));
    render(
      <MemoryRouter>
        <SidePanelProvider>
          <RegistrationsPage />
        </SidePanelProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId("side-canvas")).toBeInTheDocument();
    for (const table of screen.getAllByRole("table")) {
      expect(table.closest("section")).toHaveAttribute("aria-busy", "true");
      expect(within(table).getByRole("button", { name: "Nome" })).toBeDisabled();
    }
  });

  it("paginates five companies and resets the page when filters change", async () => {
    vi.mocked(listAllCompanies).mockResolvedValue(
      Array.from({ length: 6 }, (_, index) => ({ ...pendingCompany, id: `company-${index}`, tradeName: `Solar ${index}` })),
    );
    vi.mocked(listSolarPanelModelsByStatus).mockResolvedValue([]);
    render(
      <MemoryRouter>
        <SidePanelProvider>
          <RegistrationsPage />
        </SidePanelProvider>
      </MemoryRouter>,
    );
    await screen.findByText("Solar 0");
    const table = screen.getByRole("table", { name: "Empresas pendentes" });
    expect(within(table).getAllByRole("row")).toHaveLength(6);
    expect(screen.queryByText("Solar 5")).not.toBeInTheDocument();
    const section = table.closest("section")!;
    const next = within(section)
      .getAllByRole("button")
      .find((button) => button.getAttribute("title") === "Pr\u00f3xima p\u00e1gina")!;
    fireEvent.click(next);
    expect(screen.getByText("Solar 5")).toBeInTheDocument();
    expect(screen.queryByText("Solar 0")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Situa\u00e7\u00e3o:/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Todos" }));
    expect(screen.getByText("Solar 0")).toBeInTheDocument();
  });
});
