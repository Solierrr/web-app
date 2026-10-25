const permissions = vi.hoisted(() => new Set<string>());
vi.mock("@/lib/shared/context/ActiveContext", () => ({
  useActiveContext: () => ({ isAdmin: false, can: (permission: string) => permissions.has(permission) }),
}));
vi.mock("@@/layout/access/canvas/SideCanvas", () => ({ default: () => null }));
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import EnterpriseProfile from "./EnterpriseProfile";

vi.mock("@/features/companies/company.service", () => ({
  getMyCompany: vi.fn(),
}));

import { getMyCompany } from "@/features/companies/company.service";
import { CompanyStatus } from "@/features/companies/company.enum";
import type { Company } from "@/features/companies/company";

const mockedGetCompany = vi.mocked(getMyCompany);

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
    permissions.clear();
    vi.stubEnv("VITE_MOCKS", "DEACTIVATED");
  });

  it("allows image upload independently of company data editing", async () => {
    permissions.add("PUT /api/company-photos/company/{companyId}/type/{type}");
    mockedGetCompany.mockResolvedValue(company);
    render(
      <MemoryRouter>
        <EnterpriseProfile />
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Imagens do perfil" }));
    expect(screen.getAllByRole("button", { name: "Salvar imagem" })).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "Remover imagem" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "editar" })).not.toBeInTheDocument();
  });
  it("does not offer image or address operations from company editing permission", async () => {
    permissions.add("PUT /api/companies/{id}");
    mockedGetCompany.mockResolvedValue({
      ...company,
      address: {
        id: "address",
        street: "Rua restrita",
        number: "1",
        neighborhood: "Centro",
        city: "Cidade",
        state: "SP",
        zipCode: "12345678",
        country: "",
      },
    });
    render(
      <MemoryRouter>
        <EnterpriseProfile />
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "editar" }));
    expect(screen.queryByDisplayValue("Rua restrita")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Imagens do perfil" })).not.toBeInTheDocument();
  });

  it("renders a skeleton while the company is loading", () => {
    mockedGetCompany.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <EnterpriseProfile />
      </MemoryRouter>,
    );

    expect(screen.queryByText("Solaria Energia")).not.toBeInTheDocument();
  });

  it("renders the mocked company once loaded", async () => {
    mockedGetCompany.mockResolvedValue(company);

    render(
      <MemoryRouter>
        <EnterpriseProfile />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Solaria Energia" })).toBeInTheDocument();
    expect(screen.getByText("Solaria Energia Solar Ltda")).toBeInTheDocument();
  });
  it("reloads the profile after switching the active company", async () => {
    mockedGetCompany.mockResolvedValueOnce(company).mockResolvedValueOnce({ ...company, id: "company-2", tradeName: "Outra empresa" });
    render(
      <MemoryRouter>
        <EnterpriseProfile />
      </MemoryRouter>,
    );
    expect(await screen.findByRole("heading", { name: "Solaria Energia" })).toBeInTheDocument();
    fireEvent(window, new Event("solaria:context"));
    expect(await screen.findByRole("heading", { name: "Outra empresa" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Solaria Energia" })).not.toBeInTheDocument();
  });
});
