import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import CompanyFeed from "./CompanyFeed";

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

describe("CompanyFeed", () => {
  beforeEach(() => {
    mockedGetCompanies.mockReset();
  });

  it("renders a skeleton while the companies are loading", () => {
    mockedGetCompanies.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <CompanyFeed />
      </MemoryRouter>,
    );

    expect(screen.queryByText("Solaria Energia")).not.toBeInTheDocument();
  });

  it("renders the mocked companies once loaded", async () => {
    mockedGetCompanies.mockResolvedValue(items);

    render(
      <MemoryRouter>
        <CompanyFeed />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Solaria Energia")).toBeInTheDocument();
  });
});
