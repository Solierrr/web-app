import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import CompanyProfileView from "./CompanyProfileView";
vi.mock("./CompanyProfileProjects", () => ({ default: ({ companyId }: { companyId: string }) => <p>private-projects:{companyId}</p> }));
const company = { id: "company-1", tradeName: "Aurora Solar", slug: "aurora", city: "Recife", state: "PE" };
function view(path: string, canViewProjects = false) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <CompanyProfileView company={company} canViewProjects={canViewProjects} summary={<p>Resumo da Aurora</p>} offers={<p>Ofertas da Aurora</p>} />
    </MemoryRouter>,
  );
}
describe("CompanyProfileView", () => {
  it("does not expose the private project section to anonymous visitors even with a query parameter", () => {
    view("/pt-BR/empresa/aurora?tab=projects");
    expect(screen.queryByRole("link", { name: "Projetos" })).not.toBeInTheDocument();
    expect(screen.queryByText(/private-projects/)).not.toBeInTheDocument();
    expect(screen.getByText("Ofertas da Aurora")).toBeInTheDocument();
  });
  it("opens the accessible company projects from the shared profile navigation", () => {
    view("/pt-BR/empresa/aurora", true);
    fireEvent.click(screen.getByRole("link", { name: "Projetos" }));
    expect(screen.getByText("private-projects:company-1")).toBeInTheDocument();
    expect(screen.queryByText("Ofertas da Aurora")).not.toBeInTheDocument();
  });
  it("keeps the summary fixed above the tabs and opens on the products tab", () => {
    view("/pt-BR/empresa/aurora", true);
    expect(screen.getByText("Resumo da Aurora")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Conteúdo do perfil da empresa" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Sobre a empresa" })).not.toBeInTheDocument();
    expect(screen.getByText("Ofertas da Aurora")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Projetos" }));
    expect(screen.getByText("Resumo da Aurora")).toBeInTheDocument();
  });
});
