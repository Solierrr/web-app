import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import CompanyProfile from "./CompanyProfile";
import Auth from "@/features/access/auth/Auth";
import { AuthContext } from "@/features/access/auth/Auth.utils";

vi.mock("@/features/companies/company.service", () => ({
  getCompanyBySlug: vi.fn(),
}));

import { getCompanyBySlug } from "@/features/companies/company.service";
import { CompanyStatus } from "@/features/companies/company.enum";
import type { Company } from "@/features/companies/company";

function renderAuthenticated(ui: React.ReactNode) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{ authenticated: true, access: { id: "1", name: "Você", email: "you@inter.com" }, login: vi.fn(), logout: vi.fn() }}>
        {ui}
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

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
        <Auth>
          <CompanyProfile />
        </Auth>
      </MemoryRouter>,
    );

    expect(screen.queryByText("Solaria Energia")).not.toBeInTheDocument();
  });

  it("renders the mocked company once loaded", async () => {
    mockedGetCompanyBySlug.mockResolvedValue(company);

    render(
      <MemoryRouter>
        <Auth>
          <CompanyProfile />
        </Auth>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Solaria Energia" })).toBeInTheDocument();
    expect(screen.getByText("Solaria Energia Solar Ltda")).toBeInTheDocument();
  });

  it("hides the contact action when the visitor is not authenticated", async () => {
    mockedGetCompanyBySlug.mockResolvedValue(company);

    render(
      <MemoryRouter>
        <Auth>
          <CompanyProfile />
        </Auth>
      </MemoryRouter>,
    );

    await screen.findByRole("heading", { name: "Solaria Energia" });

    expect(screen.queryByRole("link", { name: /contato/i })).not.toBeInTheDocument();
  });

  it("shows the contact action when the visitor is authenticated", async () => {
    mockedGetCompanyBySlug.mockResolvedValue(company);

    renderAuthenticated(<CompanyProfile />);

    expect(await screen.findByRole("link", { name: /contato/i })).toBeInTheDocument();
  });
});
