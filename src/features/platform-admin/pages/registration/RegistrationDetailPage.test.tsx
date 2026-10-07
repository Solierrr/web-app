import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Toast from "@@/feedback/toast/Toast";
import RegistrationDetailPage from "./RegistrationDetailPage";
import { approveCompany, getCompany } from "@/features/companies/company.service";
import { decideProfessional, listProfessionalReviews } from "@/features/professionals/review/review.service";

vi.mock("@/config/mocks/mockMode.utils", () => ({ isAlwaysMockMode: () => true }));

vi.mock("@/features/companies/company.service", () => ({ getCompany: vi.fn(), approveCompany: vi.fn(), rejectCompany: vi.fn() }));
vi.mock("@/features/professionals/review/review.service", () => ({ listProfessionalReviews: vi.fn(), decideProfessional: vi.fn() }));

vi.mock("@@/layout/access/canvas/SideCanvas", () => ({ default: () => <div data-testid="side-canvas" /> }));

const company = {
  id: "c1",
  status: "UNDER_ANALYSIS",
  type: "SUPPLIER",
  cnpj: "12345678000199",
  tradeName: "Fornecedora Solar",
  corporateName: "Fornecedora Solar Ltda",
};

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/pt-BR/admin/cadastros/:kind/:id" element={<RegistrationDetailPage />} />
        <Route path="/pt-BR/admin/cadastros" element={<p>Lista de cadastros</p>} />
      </Routes>
      <Toast />
    </MemoryRouter>,
  );
}

describe("RegistrationDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the company data and approves it, returning to the list", async () => {
    vi.mocked(getCompany).mockResolvedValue(company as never);
    vi.mocked(approveCompany).mockResolvedValue(company as never);
    renderAt("/pt-BR/admin/cadastros/company/c1");

    expect(await screen.findByText("Fornecedora Solar Ltda")).toBeInTheDocument();
    expect(screen.getByText("12345678000199")).toBeInTheDocument();
    expect(screen.getByText("Em análise manual")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Aprovar" }));
    expect(approveCompany).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "confirmar" }));

    await waitFor(() => expect(approveCompany).toHaveBeenCalledWith("c1"));
    expect(await screen.findByText("Lista de cadastros")).toBeInTheDocument();
    expect(screen.getByText("Cadastro aprovado com sucesso.")).toBeInTheDocument();
  });

  it("rejects a professional", async () => {
    vi.mocked(listProfessionalReviews).mockResolvedValue([{ id: "p1", status: "UNDER_ANALYSIS", crea: "MG-123", person: { name: "Carlos Lima" } }]);
    vi.mocked(decideProfessional).mockResolvedValue(undefined);
    renderAt("/pt-BR/admin/cadastros/professional/p1");

    expect(await screen.findByRole("heading", { name: "Carlos Lima" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Rejeitar" }));
    expect(decideProfessional).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "confirmar" }));

    await waitFor(() => expect(decideProfessional).toHaveBeenCalledWith("p1", false));
    expect(screen.getByText("Cadastro reprovado com sucesso.")).toBeInTheDocument();
  });

  it("hides the decision buttons once the request was decided", async () => {
    vi.mocked(getCompany).mockResolvedValue({ ...company, status: "APPROVED" } as never);
    renderAt("/pt-BR/admin/cadastros/company/c1");

    expect(await screen.findByText("Aprovado")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Aprovar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Rejeitar" })).not.toBeInTheDocument();
  });

  it("reports an unknown kind without calling the services", async () => {
    renderAt("/pt-BR/admin/cadastros/other/x");

    expect(await screen.findByRole("alert")).toHaveTextContent("Solicitação não encontrada.");
    expect(getCompany).not.toHaveBeenCalled();
    expect(listProfessionalReviews).not.toHaveBeenCalled();
  });

  it("tells a load failure apart from a missing request", async () => {
    vi.mocked(getCompany).mockRejectedValue(new Error("500"));
    renderAt("/pt-BR/admin/cadastros/company/c1");

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar a solicitação.");
  });

  it("shows an error when the decision fails", async () => {
    vi.mocked(getCompany).mockResolvedValue(company as never);
    vi.mocked(approveCompany).mockRejectedValue(new Error("403"));
    renderAt("/pt-BR/admin/cadastros/company/c1");

    fireEvent.click(await screen.findByRole("button", { name: "Aprovar" }));
    fireEvent.click(screen.getByRole("button", { name: "confirmar" }));

    expect(await screen.findByRole("status")).toHaveTextContent("N\u00e3o foi poss\u00edvel registrar a decis\u00e3o.");
    expect(screen.queryByText("Cadastro aprovado com sucesso.")).not.toBeInTheDocument();
  });
  it("loads the entire page without a heading above the loader", () => {
    vi.mocked(getCompany).mockReturnValue(new Promise(() => {}));
    renderAt("/pt-BR/admin/cadastros/company/c1");
    expect(screen.getByRole("main")).toHaveClass("min-h-full", "items-center", "justify-center");
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("cancels confirmation without making a decision", async () => {
    vi.mocked(getCompany).mockResolvedValue(company as never);
    renderAt("/pt-BR/admin/cadastros/company/c1");
    fireEvent.click(await screen.findByRole("button", { name: "Aprovar" }));
    fireEvent.click(screen.getByRole("button", { name: "cancelar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(approveCompany).not.toHaveBeenCalled();
  });

  it("shows certificate images and document links when provided", async () => {
    vi.mocked(listProfessionalReviews).mockResolvedValue([
      {
        id: "p1",
        status: "APPROVED",
        crea: "MG-123",
        person: { name: "Carlos" },
        certNr10Url: "https://example.com/nr10.jpg",
        certNr35Url: "https://example.com/nr35.jpg",
      },
    ]);
    renderAt("/pt-BR/admin/cadastros/professional/p1");
    expect(await screen.findByRole("img", { name: "NR-10" })).toHaveAttribute("src", "https://example.com/nr10.jpg");
    expect(screen.getByRole("img", { name: "NR-35" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir certificado: NR-10" })).toHaveAttribute("target", "_blank");
    expect(screen.getByTestId("side-canvas")).toBeInTheDocument();
  });
});
