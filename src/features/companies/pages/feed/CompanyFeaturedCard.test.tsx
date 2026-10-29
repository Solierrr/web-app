import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { DEFAULT } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { CompanyActivity } from "@/features/companies/company.enum";
import type { CatalogCompany } from "@/features/companies/company.service";
import CompanyFeaturedCard from "./CompanyFeaturedCard";

const company: CatalogCompany = {
  id: "supplier-1",
  tradeName: "Equipe Solar",
  slug: "equipe-solar",
  city: "São Paulo",
  state: "SP",
  bannerUrl: "/banner.jpg",
  logoUrl: "/logo.jpg",
  activities: [CompanyActivity.TECHNICIANS, CompanyActivity.INSPECTION],
};

describe("CompanyFeaturedCard", () => {
  it("shows the company and location and opens its public profile", () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<CompanyFeaturedCard company={company} lang={DEFAULT} />} />
          <Route path={routePaths.companyProfile(DEFAULT, company.slug)} element={<h1>Perfil da empresa</h1>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText("São Paulo, SP")).toBeInTheDocument();
    expect(screen.queryByText(/Equipe de técnicos/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Equipe Solar" }));
    expect(screen.getByRole("heading", { name: "Perfil da empresa" })).toBeInTheDocument();
  });

  it("keeps the card usable when both images fail", () => {
    const { container } = render(
      <MemoryRouter>
        <CompanyFeaturedCard company={company} lang={DEFAULT} />
      </MemoryRouter>,
    );
    container.querySelectorAll("img").forEach((image) => fireEvent.error(image));
    expect(container.querySelectorAll("img")).toHaveLength(0);
    expect(screen.getByText("E")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: company.tradeName })).toHaveAttribute("href", routePaths.companyProfile(DEFAULT, company.slug));
  });

  it("does not invent a location when the catalog omits it", () => {
    render(
      <MemoryRouter>
        <CompanyFeaturedCard
          company={{ ...company, activities: undefined, city: null, state: null, bannerUrl: undefined, logoUrl: undefined }}
          lang={DEFAULT}
        />
      </MemoryRouter>,
    );
    expect(screen.queryByText(/São Paulo/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: company.tradeName })).toBeInTheDocument();
  });
});
