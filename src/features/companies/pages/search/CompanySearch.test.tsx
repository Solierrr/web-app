import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import CompanySearch from "./CompanySearch";

vi.mock("@/features/companies/company.service", () => ({
  getCatalogCompanies: vi.fn(),
}));

import { getCatalogCompanies } from "@/features/companies/company.service";
import type { CatalogCompany } from "@/features/companies/company.service";

const mockedGetCompanies = vi.mocked(getCatalogCompanies);

const items: CatalogCompany[] = [
  {
    id: "company-1",
    city: "São Paulo",
    state: "SP",
    tradeName: "Solaria Energia",
    slug: "solaria-energia",
  },
];

describe("CompanySearch", () => {
  beforeEach(() => {
    mockedGetCompanies.mockReset();
  });

  it("filters companies by name or locality", async () => {
    mockedGetCompanies.mockResolvedValue(items);

    render(
      <MemoryRouter>
        <CompanySearch />
      </MemoryRouter>,
    );

    await screen.findByText("Solaria Energia");
    const search = screen.getByRole("searchbox");
    fireEvent.change(search, { target: { value: "sao paulo" } });
    expect(screen.getByText("Solaria Energia")).toBeInTheDocument();
    fireEvent.change(search, { target: { value: "inexistente" } });
    expect(screen.queryByText("Solaria Energia")).not.toBeInTheDocument();
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
