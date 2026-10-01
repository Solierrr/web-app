import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegistrationDetailPage from "./RegistrationDetailPage";
import { approveCompany, getCompany } from "@/features/companies/company.service";
import { decideProfessional, listProfessionalReviews } from "@/features/professionals/review/review.service";

vi.mock("@/features/companies/company.service", () => ({ getCompany: vi.fn(), approveCompany: vi.fn(), rejectCompany: vi.fn() }));
vi.mock("@/features/professionals/review/review.service", () => ({ listProfessionalReviews: vi.fn(), decideProfessional: vi.fn() }));

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

    await waitFor(() => expect(approveCompany).toHaveBeenCalledWith("c1"));
    expect(await screen.findByText("Lista de cadastros")).toBeInTheDocument();
  });

  it("rejects a professional", async () => {
    vi.mocked(listProfessionalReviews).mockResolvedValue([{ id: "p1", status: "UNDER_ANALYSIS", crea: "MG-123", person: { name: "Carlos Lima" } }]);
    vi.mocked(decideProfessional).mockResolvedValue(undefined);
    renderAt("/pt-BR/admin/cadastros/professional/p1");

    expect(await screen.findByText("Carlos Lima")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Rejeitar" }));

    await waitFor(() => expect(decideProfessional).toHaveBeenCalledWith("p1", false));
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

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível registrar a decisão.");
  });
});
