import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SolarPanelFeed from "@/features/solar-panel/pages/feed/SolarPanelFeed";
import ProfessionalFeed from "@/features/professionals/pages/feed/ProfessionalFeed";
import CompanyFeed from "@/features/companies/pages/feed/CompanyFeed";
import { getCatalogSolarPanels } from "@/features/solar-panel/solarPanel.service";
import { getCatalogTechnicians } from "@/features/professionals/professional.service";
import { getCatalogCompanies } from "@/features/companies/company.service";
import { CompanyActivity } from "@/features/companies/company.enum";
import { TechnicalAffiliationType } from "@/features/professionals/professional.enum";
import { solarPanelAnnouncementMocks } from "@/config/mocks/registry";
import Marketplace from "./Marketplace";
import { getCatalogTeams } from "@/features/professionals/professionalTeam.service";

vi.mock("@/features/solar-panel/solarPanel.service", () => ({ getCatalogSolarPanels: vi.fn() }));
vi.mock("@/features/professionals/professional.service", () => ({ getCatalogTechnicians: vi.fn() }));
vi.mock("@/features/companies/company.service", () => ({ getCatalogCompanies: vi.fn() }));

vi.mock("@/features/professionals/professionalTeam.service", async (original) => ({
  ...(await original<typeof import("@/features/professionals/professionalTeam.service")>()),
  getCatalogTeams: vi.fn(),
}));
beforeEach(() => {
  vi.mocked(getCatalogTeams).mockResolvedValue([
    { id: "team", companyId: "company", companyName: "Empresa", companySlug: "equipe", name: "Equipe", members: [] },
  ]);
  vi.mocked(getCatalogSolarPanels).mockResolvedValue(solarPanelAnnouncementMocks.slice(0, 3));
  vi.mocked(getCatalogTechnicians).mockResolvedValue([
    { id: "independent", slug: "ana", name: "Ana", crea: "", professions: [], affiliationType: TechnicalAffiliationType.INDEPENDENT },
    { id: "affiliated", slug: "bruno", name: "Bruno", crea: "", professions: [], affiliationType: TechnicalAffiliationType.AFFILIATED },
  ]);
  vi.mocked(getCatalogCompanies).mockResolvedValue([
    { id: "supplier", slug: "solar", tradeName: "Solar", city: null, state: null, activities: [CompanyActivity.SOLAR_PANELS] },
    { id: "team", slug: "equipe", tradeName: "Equipe", city: null, state: null, activities: [CompanyActivity.TECHNICIANS], hasTechnicalTeam: true },
    { id: "other", slug: "outra", tradeName: "Outra", city: null, state: null, activities: [] },
  ]);
});

function renderFeed(element: React.ReactNode, path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/:lang/*" element={element} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Marketplace page views", () => {
  it("sorts offers on the same page by recent publication or trending score", async () => {
    const { container } = renderFeed(<SolarPanelFeed />, "/pt-BR/placas-solares");
    await screen.findByText(solarPanelAnnouncementMocks[1].title);
    const firstOffer = () => container.querySelector("section a")?.textContent;
    expect(firstOffer()).toContain(solarPanelAnnouncementMocks[1].title);
    fireEvent.click(screen.getByRole("link", { name: "Em alta" }));
    await waitFor(() => expect(firstOffer()).toContain(solarPanelAnnouncementMocks[2].title));
    expect(screen.getByRole("link", { name: "Em alta" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Recentes" })).toHaveAttribute("href", "/pt-BR/placas-solares?view=recent");
  });

  it("filters independent technicians and shows teams linked to company profiles", async () => {
    renderFeed(<ProfessionalFeed />, "/pt-BR/profissionais");
    await screen.findByText("Bruno");
    fireEvent.click(screen.getByRole("link", { name: "Autônomos" }));
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.queryByText("Bruno")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Equipes" }));
    const team = await screen.findByRole("link", { name: "Equipe" });
    expect(team).toHaveAttribute("href", "/pt-BR/empresa/equipe");
    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Profissionais" }));
    expect(await screen.findByText("Bruno")).toBeInTheDocument();
  });

  it("keeps the service selector usable after a team request fails", async () => {
    vi.mocked(getCatalogTeams).mockRejectedValue(new Error("offline"));
    renderFeed(<ProfessionalFeed />, "/pt-BR/profissionais");
    await screen.findByText("Bruno");
    fireEvent.click(screen.getByRole("link", { name: "Equipes" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Autônomos" }));
    expect(await screen.findByText("Ana")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  it("filters suppliers, service companies and other companies within the companies page", async () => {
    renderFeed(<CompanyFeed />, "/pt-BR/empresas");
    await screen.findByText("Solar");
    expect(screen.queryByText("Equipe")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Prestadoras" }));
    expect(screen.getByText("Equipe")).toBeInTheDocument();
    expect(screen.queryByText("Solar")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Outras" }));
    expect(screen.getByText("Outra")).toBeInTheDocument();
    expect(screen.queryByText("Equipe")).not.toBeInTheDocument();
  });

  it("keeps language, search parameters and hashes and defaults invalid views", () => {
    renderFeed(<Marketplace category="solarPanels" search />, "/en-US/search/solar-panels?q=test&view=invalid#results");
    const recent = screen.getByRole("link", { name: "Recentes" });
    expect(recent).toHaveAttribute("aria-current", "page");
    expect(recent).toHaveAttribute("href", "/en-US/search/solar-panels?q=test&view=recent#results");
    expect(screen.getByRole("link", { name: "Em alta" })).toHaveAttribute("href", "/en-US/search/solar-panels?q=test&view=trending#results");
  });
});
