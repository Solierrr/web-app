import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import CompanyProfile from "./CompanyProfile";

vi.mock("@/features/companies/company.service", () => ({
  getCatalogCompanyBySlug: vi.fn(),
}));

import { getCatalogCompanyBySlug } from "@/features/companies/company.service";
import type { CatalogCompany } from "@/features/companies/company.service";

const mockedGetCompanyBySlug = vi.mocked(getCatalogCompanyBySlug);

const company: CatalogCompany = {
  id: "company-1",
  city: "São Paulo",
  state: "SP",
  tradeName: "Solaria Energia",
  slug: "solaria-energia",
};

describe("CompanyProfile", () => {
  beforeEach(() => {
    mockedGetCompanyBySlug.mockReset();
  });

  it("renders a skeleton while the company is loading", () => {
    mockedGetCompanyBySlug.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <CompanyProfile />
      </MemoryRouter>,
    );

    expect(screen.queryByText("Solaria Energia")).not.toBeInTheDocument();
  });

  it("renders the mocked company once loaded", async () => {
    mockedGetCompanyBySlug.mockResolvedValue(company);

    render(
      <MemoryRouter>
        <CompanyProfile />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Solaria Energia" })).toBeInTheDocument();
    expect(screen.getByText("São Paulo/SP")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "entrar em contato" })).toHaveAttribute("href", "/pt-BR/mensagens/empresa/company-1");
  });
});
