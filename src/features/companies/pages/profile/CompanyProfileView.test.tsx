import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import CompanyProfileView from "./CompanyProfileView";
vi.mock("./CompanyProfileProjects", () => ({ default: ({ companyId }: { companyId: string }) => <p>private-projects:{companyId}</p> }));
const company = { id: "company-1", tradeName: "Aurora Solar", slug: "aurora", city: "Recife", state: "PE" };
function view(path: string, canViewProjects = false) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <CompanyProfileView company={company} canViewProjects={canViewProjects} offers={<p>Ofertas da Aurora</p>}>
        <p>Dados da Aurora</p>
      </CompanyProfileView>
    </MemoryRouter>,
  );
}
describe("CompanyProfileView", () => {
  it("does not expose the private project section to anonymous visitors even with a query parameter", () => {
    view("/pt-BR/empresa/aurora?tab=projects");
    expect(screen.queryByRole("link", { name: "Projetos" })).not.toBeInTheDocument();
    expect(screen.queryByText(/private-projects/)).not.toBeInTheDocument();
    expect(screen.getByText("Dados da Aurora")).toBeInTheDocument();
  });
  it("opens the accessible company projects from the shared profile navigation", () => {
    view("/pt-BR/empresa/aurora", true);
    fireEvent.click(screen.getByRole("link", { name: "Projetos" }));
    expect(screen.getByText("private-projects:company-1")).toBeInTheDocument();
    expect(screen.queryByText("Dados da Aurora")).not.toBeInTheDocument();
  });
  it("uses a navigable URL for offers while retaining other query parameters", () => {
    view("/pt-BR/empresa/aurora?source=catalog");
    expect(screen.getByRole("link", { name: "Ofertas" })).toHaveAttribute("href", "/pt-BR/empresa/aurora?source=catalog&tab=offers");
    fireEvent.click(screen.getByRole("link", { name: "Ofertas" }));
    expect(screen.getByText("Ofertas da Aurora")).toBeInTheDocument();
    expect(screen.queryByText("Dados da Aurora")).not.toBeInTheDocument();
  });
});
