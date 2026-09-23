import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import EnterpriseProfile from "./EnterpriseProfile";

vi.mock("@/features/companies/company.service", () => ({
  getCompany: vi.fn(),
}));

import { getCompany } from "@/features/companies/company.service";
import { CompanyStatus } from "@/features/companies/company.enum";
import type { Company } from "@/features/companies/company";

const mockedGetCompany = vi.mocked(getCompany);

const company: Company = {
  id: "company-1",
  status: CompanyStatus.APPROVED,
  cnpj: "12345678000190",
  tradeName: "Solaria Energia",
  corporateName: "Solaria Energia Solar Ltda",
  slug: "solaria-energia",
};

describe("EnterpriseProfile", () => {
  beforeEach(() => {
    mockedGetCompany.mockReset();
  });

  it("renders a skeleton while the company is loading", () => {
    mockedGetCompany.mockReturnValue(new Promise(() => {}));

    render(<EnterpriseProfile />);

    expect(screen.queryByText("Solaria Energia")).not.toBeInTheDocument();
  });

  it("renders the mocked company once loaded", async () => {
    mockedGetCompany.mockResolvedValue(company);

    render(<EnterpriseProfile />);

    expect(await screen.findByRole("heading", { name: "Solaria Energia" })).toBeInTheDocument();
    expect(screen.getByText("Solaria Energia Solar Ltda")).toBeInTheDocument();
  });
});
