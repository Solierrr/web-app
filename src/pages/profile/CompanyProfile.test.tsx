import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import CompanyProfile from "./CompanyProfile";

vi.mock("@/features/companies/company.service", () => ({
  getCompanyBySlug: vi.fn(),
}));

import { getCompanyBySlug } from "@/features/companies/company.service";
import { CompanyStatus } from "@/features/companies/company.enum";
import type { Company } from "@/features/companies/company";

const mockedGetCompanyBySlug = vi.mocked(getCompanyBySlug);

const company: Company = {
  id: "company-1",
  status: CompanyStatus.APPROVED,
  cnpj: "12345678000190",
  tradeName: "Solaria Energia",
  corporateName: "Solaria Energia Solar Ltda",
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
    expect(screen.getByText("Solaria Energia Solar Ltda")).toBeInTheDocument();
  });
});
