import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CompanyOnboarding from "./CompanyOnboarding";
import * as companyService from "@/features/companies/company.service";
import { validateCnpjCategory } from "@/shared/validation/aiValidation.service";

vi.mock("@/features/companies/company.service", () => ({
  createCompany: vi.fn(),
  createAddress: vi.fn(),
  createBusinessContact: vi.fn(),
  attachCompanyAddress: vi.fn(),
  attachCompanyBusinessContact: vi.fn(),
}));
vi.mock("@/shared/validation/aiValidation.service", () => ({ validateCnpjCategory: vi.fn() }));

const VALID_CNPJ = "11.444.777/0001-61";

function fillBaseFields() {
  fireEvent.change(screen.getByLabelText("CNPJ"), { target: { value: VALID_CNPJ } });
  fireEvent.change(screen.getByLabelText("Nome fantasia"), { target: { value: "Solar XPTO" } });
  fireEvent.change(screen.getByLabelText("Razão social"), { target: { value: "Solar XPTO Ltda" } });
  fireEvent.change(screen.getByLabelText("CEP"), { target: { value: "01001000" } });
  fireEvent.change(screen.getByLabelText("UF"), { target: { value: "SP" } });
  fireEvent.change(screen.getByLabelText("Cidade"), { target: { value: "São Paulo" } });
  fireEvent.change(screen.getByLabelText("Rua"), { target: { value: "Praça da Sé" } });
  fireEvent.change(screen.getByLabelText("E-mail corporativo"), { target: { value: "contato@solarxpto.com" } });
}

describe("CompanyOnboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an invalid cnpj before calling the backend", async () => {
    render(
      <MemoryRouter>
        <CompanyOnboarding />
      </MemoryRouter>,
    );

    fillBaseFields();
    fireEvent.change(screen.getByLabelText("CNPJ"), { target: { value: "11.111.111/1111-11" } });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar empresa" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("CNPJ inválido");
    expect(companyService.createCompany).not.toHaveBeenCalled();
  });

  it("creates the company, address and contact, then shows the cnpj category result for suppliers", async () => {
    vi.mocked(companyService.createCompany).mockResolvedValue({ id: "company-1", status: "UNDER_ANALYSIS" } as never);
    vi.mocked(companyService.createAddress).mockResolvedValue({ id: "address-1" });
    vi.mocked(companyService.createBusinessContact).mockResolvedValue({ id: "contact-1" });
    vi.mocked(validateCnpjCategory).mockResolvedValue({
      status: "VALID", cnpj: "11444777000161", company_name: "Solar XPTO", trade_name: "Solar XPTO",
      is_active: true, matched_category: "ENGENHARIA", error_code: null, reason: "Compatível",
    });

    render(
      <MemoryRouter>
        <CompanyOnboarding />
      </MemoryRouter>,
    );

    fillBaseFields();
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar empresa" }));

    await waitFor(() => expect(companyService.createCompany).toHaveBeenCalledWith({
      type: "SUPPLIER", cnpj: "11444777000161", tradeName: "Solar XPTO", corporateName: "Solar XPTO Ltda",
    }));
    expect(companyService.attachCompanyAddress).toHaveBeenCalledWith("company-1", "address-1");
    expect(companyService.attachCompanyBusinessContact).toHaveBeenCalledWith("company-1", "contact-1");

    expect(await screen.findByText("Em análise")).toBeInTheDocument();
    expect(screen.getByText("CNPJ compatível com o setor solar/elétrico.")).toBeInTheDocument();
  });

  it("does not call the cnpj category validation for demandant companies", async () => {
    vi.mocked(companyService.createCompany).mockResolvedValue({ id: "company-1", status: "UNDER_ANALYSIS" } as never);
    vi.mocked(companyService.createAddress).mockResolvedValue({ id: "address-1" });
    vi.mocked(companyService.createBusinessContact).mockResolvedValue({ id: "contact-1" });

    render(
      <MemoryRouter>
        <CompanyOnboarding />
      </MemoryRouter>,
    );

    fillBaseFields();
    fireEvent.change(screen.getByLabelText("Tipo de empresa"), { target: { value: "DEMANDANT" } });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar empresa" }));

    await screen.findByText("Em análise");
    expect(validateCnpjCategory).not.toHaveBeenCalled();
  });
});
