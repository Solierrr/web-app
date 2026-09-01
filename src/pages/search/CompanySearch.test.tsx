import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import CompanySearch from "./CompanySearch";

vi.mock("@/features/companies/company.service", () => ({
  getCompanies: vi.fn(),
}));

import { getCompanies } from "@/features/companies/company.service";
import { CompanyStatus } from "@/features/companies/company.enum";
import type { Company } from "@/features/companies/company";

const mockedGetCompanies = vi.mocked(getCompanies);

const items: Company[] = [
  {
    id: "company-1",
    status: CompanyStatus.APPROVED,
    cnpj: "12345678000190",
    tradeName: "Solaria Energia",
    corporateName: "Solaria Energia Solar Ltda",
    slug: "solaria-energia",
  },
];

describe("CompanySearch", () => {
  beforeEach(() => {
    mockedGetCompanies.mockReset();
  });

  it("renders the page heading and filter controls", () => {
    mockedGetCompanies.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <CompanySearch />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Empresas" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "filtrar-busca" })).toBeInTheDocument();
    expect(screen.getByText("Fornecedor")).toBeInTheDocument();
  });

  it("renders the mocked companies in the results grid", async () => {
    mockedGetCompanies.mockResolvedValue(items);

    render(
      <MemoryRouter>
        <CompanySearch />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Solaria Energia")).toBeInTheDocument();
  });
});
