import { fireEvent, render, screen } from "@testing-library/react";
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

  it("shows the entire company selection without a next-page control", async () => {
    mockedGetCompanies.mockResolvedValue(Array.from({ length: 24 }, (_, index) => ({ ...items[0], id: `company-${index}`, slug: `company-${index}`, tradeName: `Empresa ${index + 1}` })));
    render(<MemoryRouter><CompanyFeed /></MemoryRouter>);
    expect(await screen.findByRole("link", { name: "Empresa 24" })).toHaveAttribute("href", "/pt-BR/empresa/company-23");
    expect(screen.getAllByRole("link", { name: /^Empresa \d+$/ })).toHaveLength(24);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Próxima página" })).not.toBeInTheDocument();
  });

  it("offers a return to the start after scrolling and respects reduced motion", () => {
    mockedGetCompanies.mockReturnValue(new Promise(() => {}));
    const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const position = vi.spyOn(window, "scrollY", "get").mockReturnValue(0);
    render(<MemoryRouter><CompanyFeed /></MemoryRouter>);
    expect(screen.queryByRole("button", { name: "Voltar ao topo" })).not.toBeInTheDocument();
    position.mockReturnValue(700);
    fireEvent.scroll(window);
    fireEvent.click(screen.getByRole("button", { name: "Voltar ao topo" }));
    expect(scroll).toHaveBeenCalledWith({ top: 0, behavior: "instant" });
    position.mockRestore();
    scroll.mockRestore();
    vi.unstubAllGlobals();
  });
});
