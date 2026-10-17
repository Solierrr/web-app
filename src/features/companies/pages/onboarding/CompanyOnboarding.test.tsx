import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CompanyOnboarding from "./CompanyOnboarding";
import * as companyService from "@/features/companies/company.service";
import { validateCnpjCategory } from "@/lib/shared/validation/aiValidation.service";

vi.mock("@/features/companies/company.service", () => ({
  createCompany: vi.fn(),
}));
vi.mock("@/lib/shared/validation/aiValidation.service", () => ({ validateCnpjCategory: vi.fn() }));

const VALID_CNPJ = "11.444.777/0001-61";

function fillBaseFields() {
  fireEvent.click(screen.getByRole("button", { name: "Endereço" }));
  fireEvent.click(screen.getByRole("button", { name: "Contato comercial" }));
  fireEvent.change(screen.getByLabelText("CNPJ"), { target: { value: VALID_CNPJ } });
  fireEvent.change(screen.getByLabelText("Nome fantasia"), { target: { value: "Solar XPTO" } });
  fireEvent.change(screen.getByLabelText("Razão social"), { target: { value: "Solar XPTO Ltda" } });
  fireEvent.change(screen.getByLabelText("CEP"), { target: { value: "01001000" } });
  fireEvent.change(screen.getByRole("combobox", { name: "UF" }), { target: { value: "SP" } });
  fireEvent.change(screen.getByLabelText("Cidade"), { target: { value: "S4PZ" } });
  fireEvent.change(screen.getByLabelText("Rua"), { target: { value: "Praça da Sé" } });
  fireEvent.change(screen.getByLabelText("E-mail corporativo"), { target: { value: "contato@solarxpto.com" } });
}

describe("CompanyOnboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ erro: true }) }));
  });

  it("fills the address from a complete postal code and keeps manual edits", async () => {
    let resolve!: (value: Response) => void;
    vi.mocked(fetch).mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }) as Promise<Response>,
    );
    render(
      <MemoryRouter>
        <CompanyOnboarding />
      </MemoryRouter>,
    );
    if (screen.getByRole("button", { name: "Endereço" }).getAttribute("aria-expanded") === "false")
      fireEvent.click(screen.getByRole("button", { name: "Endereço" }));
    fireEvent.change(screen.getByLabelText("CEP"), { target: { value: "01001-000" } });
    fireEvent.change(screen.getByLabelText("Rua"), { target: { value: "Rua editada" } });
    resolve({ ok: true, json: async () => ({ uf: "SP", localidade: "São Paulo", bairro: "Sé", logradouro: "Praça da Sé" }) } as Response);
    await waitFor(() => expect(screen.getByLabelText("Cidade")).toHaveValue("São Paulo"));
    expect(screen.getByLabelText("Rua")).toHaveValue("Rua editada");
    expect(screen.getByRole("combobox", { name: "UF" })).toHaveValue("SP");
    expect(screen.getByLabelText("CEP")).toHaveValue("01001-000");
  });

  it("ignores a stale postal lookup after changing the postal code", async () => {
    let resolveFirst!: (value: Response) => void;
    vi.mocked(fetch)
      .mockReturnValueOnce(
        new Promise((done) => {
          resolveFirst = done;
        }) as Promise<Response>,
      )
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ uf: "RJ", localidade: "Rio de Janeiro", bairro: "Centro", logradouro: "Rua nova" }),
      } as Response);
    render(
      <MemoryRouter>
        <CompanyOnboarding />
      </MemoryRouter>,
    );
    if (screen.getByRole("button", { name: "Endereço" }).getAttribute("aria-expanded") === "false")
      fireEvent.click(screen.getByRole("button", { name: "Endereço" }));
    fireEvent.change(screen.getByLabelText("CEP"), { target: { value: "01001000" } });
    if (screen.getByRole("button", { name: "Endereço" }).getAttribute("aria-expanded") === "false")
      fireEvent.click(screen.getByRole("button", { name: "Endereço" }));
    fireEvent.change(screen.getByLabelText("CEP"), { target: { value: "20040002" } });
    await waitFor(() => expect(screen.getByLabelText("Cidade")).toHaveValue("Rio de Janeiro"));
    resolveFirst({ ok: true, json: async () => ({ uf: "SP", localidade: "São Paulo" }) } as Response);
    await waitFor(() => expect(screen.getByRole("combobox", { name: "UF" })).toHaveValue("RJ"));
  });

  it("keeps manual entry available when postal lookup fails", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Offline"));
    render(
      <MemoryRouter>
        <CompanyOnboarding />
      </MemoryRouter>,
    );
    if (screen.getByRole("button", { name: "Endereço" }).getAttribute("aria-expanded") === "false")
      fireEvent.click(screen.getByRole("button", { name: "Endereço" }));
    fireEvent.change(screen.getByLabelText("CEP"), { target: { value: "01001000" } });
    expect(await screen.findByRole("status")).toHaveTextContent("Não foi possível consultar o CEP");
    fireEvent.change(screen.getByLabelText("Cidade"), { target: { value: "Cidade manual" } });
    expect(screen.getByLabelText("Cidade")).toHaveValue("Cidade manual");
  });

  it("limits a state abbreviation and allows selecting it", () => {
    render(
      <MemoryRouter>
        <CompanyOnboarding />
      </MemoryRouter>,
    );
    if (screen.getByRole("button", { name: "Endereço" }).getAttribute("aria-expanded") === "false")
      fireEvent.click(screen.getByRole("button", { name: "Endereço" }));
    fireEvent.change(screen.getByRole("combobox", { name: "UF" }), { target: { value: "S4PZ" } });
    fireEvent.keyDown(screen.getByRole("combobox", { name: "UF" }), { key: "Enter" });
    expect(screen.getByRole("combobox", { name: "UF" })).toHaveValue("SP");
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

  it("creates the company with address and contact in one request, then shows the cnpj category result for suppliers", async () => {
    vi.mocked(companyService.createCompany).mockResolvedValue({ id: "company-1", status: "UNDER_ANALYSIS" } as never);
    vi.mocked(validateCnpjCategory).mockResolvedValue({
      status: "VALID",
      cnpj: "11444777000161",
      company_name: "Solar XPTO",
      trade_name: "Solar XPTO",
      is_active: true,
      matched_category: "ENGENHARIA",
      error_code: null,
      reason: "Compatível",
    });

    render(
      <MemoryRouter>
        <CompanyOnboarding />
      </MemoryRouter>,
    );

    fillBaseFields();
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar empresa" }));

    await waitFor(() =>
      expect(companyService.createCompany).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "SUPPLIER",
          cnpj: "11444777000161",
          tradeName: "Solar XPTO",
          corporateName: "Solar XPTO Ltda",
          address: expect.objectContaining({ state: "SP", zipCode: "01001000", street: "Praça da Sé" }),
          businessContact: expect.objectContaining({ companyEmail: "contato@solarxpto.com" }),
        }),
      ),
    );

    expect(await screen.findByText("Em análise")).toBeInTheDocument();
    expect(screen.getByText("CNPJ compatível com o setor solar/elétrico.")).toBeInTheDocument();
  });

  it("does not call the cnpj category validation for demandant companies", async () => {
    vi.mocked(companyService.createCompany).mockResolvedValue({ id: "company-1", status: "UNDER_ANALYSIS" } as never);

    render(
      <MemoryRouter>
        <CompanyOnboarding />
      </MemoryRouter>,
    );

    fillBaseFields();
    fireEvent.click(screen.getByRole("button", { name: "Tipo de empresa" }));
    fireEvent.click(screen.getByRole("option", { name: "Demandante" }));
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar empresa" }));

    await screen.findByText("Em análise");
    expect(validateCnpjCategory).not.toHaveBeenCalled();
  });

  it("keeps the section values in the form when collapsed and expands invalid fields", () => {
    render(
      <MemoryRouter>
        <CompanyOnboarding />
      </MemoryRouter>,
    );
    const zipCode = screen.getByLabelText("CEP");
    fireEvent.change(zipCode, { target: { value: "01001000" } });
    expect(screen.getByRole("button", { name: "Endereço" })).toHaveAttribute("aria-expanded", "false");
    expect(zipCode.closest(".form-section-body")).toHaveAttribute("aria-hidden", "true");
    expect(zipCode.closest(".form-section-body")).toHaveAttribute("inert");
    expect(new FormData(zipCode.closest("form")!).get("zipCode")).toBe("01001-000");
    fireEvent.invalid(zipCode);
    expect(zipCode.closest(".form-section-body")).toHaveAttribute("aria-hidden", "false");
    expect(screen.getByRole("button", { name: "Endereço" })).toHaveAttribute("aria-expanded", "true");
  });
});
