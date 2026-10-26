import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import CompanyFeed from "./CompanyFeed";

vi.mock("@/features/companies/company.service", () => ({
  getCatalogCompanies: vi.fn(),
}));

import { getCatalogCompanies } from "@/features/companies/company.service";
import type { CatalogCompany } from "@/features/companies/company.service";
import { CompanyActivity } from "@/features/companies/company.enum";

const mockedGetCompanies = vi.mocked(getCatalogCompanies);

const items: CatalogCompany[] = [
  {
    id: "company-1",
    activities: [CompanyActivity.SOLAR_PANELS],
    city: "São Paulo",
    state: "SP",
    tradeName: "Solaria Energia",
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

  it("shows an empty state without removing marketplace navigation", async () => {
    mockedGetCompanies.mockResolvedValue([]);
    render(
      <MemoryRouter>
        <CompanyFeed />
      </MemoryRouter>,
    );
    expect(await screen.findByText("Nenhuma empresa disponível nesta categoria.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Todas" })).toHaveAttribute("aria-current", "page");
  });
});
