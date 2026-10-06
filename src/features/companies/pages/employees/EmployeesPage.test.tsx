vi.mock("@@/layout/access/canvas/SideCanvas", () => ({ default: () => null }));
import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import EmployeesPage from "./EmployeesPage";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { getUser } from "@/features/users/user/user.service";
import * as managementService from "@/features/companies/company.management.service";

vi.mock("@/lib/shared/context/ActiveContext", () => ({ useActiveContext: vi.fn() }));
vi.mock("@/features/users/user/user.service", () => ({ getUser: vi.fn() }));
vi.mock("@/features/companies/company.management.service", () => ({
  listEmployees: vi.fn(),
  listPositions: vi.fn(),
  listAccessCodes: vi.fn(),
  createPosition: vi.fn(),
  generateAccessCode: vi.fn(),
  updateEmployeePosition: vi.fn(),
  removeEmployee: vi.fn(),
  revokeAccessCode: vi.fn(),
  grantPermission: vi.fn(),
  listPermissions: vi.fn(),
}));

const company = {
  id: "company-1",
  status: "APPROVED",
  type: "SUPPLIER",
  cnpj: "1",
  tradeName: "Solaria",
  corporateName: "Solaria Ltda",
  slug: "solaria",
} as never;
const adminPosition = { id: "admin-position", name: "ADMIN", accesses: "" };
const memberPosition = { id: "member-position", name: "MEMBER", accesses: "" };

describe("EmployeesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(managementService.listPositions).mockResolvedValue([adminPosition, memberPosition]);
    vi.mocked(managementService.listAccessCodes).mockResolvedValue([]);
    vi.mocked(managementService.listPermissions).mockResolvedValue([]);
    vi.mocked(getUser).mockResolvedValue({ id: "user-1", authId: "auth-1", username: "fulano", avatar: null, banner: null, active: true });
  });

  it("lists employees with their names and positions", async () => {
    vi.mocked(useActiveContext).mockReturnValue({
      loading: false,
      kind: "company",
      setKind: vi.fn(),
      company,
      isAdmin: true,
      hasCompany: true,
      isPlatformAdmin: false,
      can: () => true,
    });
    vi.mocked(managementService.listEmployees).mockResolvedValue([
      { id: "uc-1", companyId: "company-1", userId: "user-1", position: memberPosition },
    ]);

    render(
      <MemoryRouter>
        <EmployeesPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("fulano")).toBeInTheDocument();
    expect(screen.getAllByText("MEMBER").length).toBeGreaterThan(0);
  });

  it("hides management controls for non-admins", async () => {
    vi.mocked(useActiveContext).mockReturnValue({
      loading: false,
      kind: "company",
      setKind: vi.fn(),
      company,
      isAdmin: false,
      hasCompany: true,
      isPlatformAdmin: false,
      can: () => false,
    });
    vi.mocked(managementService.listEmployees).mockResolvedValue([
      { id: "uc-1", companyId: "company-1", userId: "user-1", position: memberPosition },
    ]);

    render(
      <MemoryRouter>
        <EmployeesPage />
      </MemoryRouter>,
    );

    await screen.findByText("fulano");
    expect(screen.queryByRole("button", { name: "Gerar código" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Desativar acesso" })).not.toBeInTheDocument();
  });

  it("generates an access code for a selected existing position", async () => {
    vi.mocked(useActiveContext).mockReturnValue({
      loading: false,
      kind: "company",
      setKind: vi.fn(),
      company,
      isAdmin: true,
      hasCompany: true,
      isPlatformAdmin: false,
      can: () => true,
    });
    vi.mocked(managementService.listEmployees).mockResolvedValue([]);
    vi.mocked(managementService.generateAccessCode).mockResolvedValue({
      id: "code-1",
      companyId: "company-1",
      code: "ABC12345",
      status: "ACTIVE",
      expiresAt: "2027-01-01",
      position: memberPosition,
    });

    render(
      <MemoryRouter>
        <EmployeesPage />
      </MemoryRouter>,
    );
    await screen.findByText("Nenhum funcionário ainda.");
    fireEvent.click(screen.getByRole("button", { name: "Convidar funcionário" }));

    fireEvent.change(screen.getByLabelText("Cargo existente"), { target: { value: "member-position" } });
    fireEvent.click(screen.getByRole("button", { name: "Gerar código" }));

    await waitFor(() => expect(managementService.generateAccessCode).toHaveBeenCalledWith("company-1", "member-position"));
    expect(await screen.findByText(/ABC12345/)).toBeInTheDocument();
  });

  it("creates a new position before generating a code when none is selected", async () => {
    vi.mocked(useActiveContext).mockReturnValue({
      loading: false,
      kind: "company",
      setKind: vi.fn(),
      company,
      isAdmin: true,
      hasCompany: true,
      isPlatformAdmin: false,
      can: () => true,
    });
    vi.mocked(managementService.listEmployees).mockResolvedValue([]);
    vi.mocked(managementService.createPosition).mockResolvedValue({ id: "new-position", name: "Instalador", accesses: "" });
    vi.mocked(managementService.generateAccessCode).mockResolvedValue({
      id: "code-1",
      companyId: "company-1",
      code: "XYZ98765",
      status: "ACTIVE",
      expiresAt: "2027-01-01",
      position: { id: "new-position", name: "Instalador", accesses: "" },
    });

    render(
      <MemoryRouter>
        <EmployeesPage />
      </MemoryRouter>,
    );
    await screen.findByText("Nenhum funcionário ainda.");
    fireEvent.click(screen.getByRole("button", { name: "Convidar funcionário" }));

    fireEvent.change(screen.getByLabelText("Novo cargo"), { target: { value: "Instalador" } });
    fireEvent.click(screen.getByRole("button", { name: "Gerar código" }));

    await waitFor(() => expect(managementService.createPosition).toHaveBeenCalledWith("Instalador"));
    expect(managementService.generateAccessCode).toHaveBeenCalledWith("company-1", "new-position");
  });

  it("lists administrators and team members while protecting administrator access", async () => {
    vi.mocked(useActiveContext).mockReturnValue({
      loading: false,
      kind: "company",
      setKind: vi.fn(),
      company,
      isAdmin: true,
      hasCompany: true,
      isPlatformAdmin: false,
      can: () => true,
    });
    vi.mocked(managementService.listEmployees).mockResolvedValue([
      { id: "uc-1", companyId: "company-1", userId: "user-1", position: adminPosition },
      { id: "uc-2", companyId: "company-1", userId: "user-2", position: memberPosition },
    ]);

    render(
      <MemoryRouter>
        <EmployeesPage />
      </MemoryRouter>,
    );

    const table = await screen.findByRole("table", { name: "Equipe" });
    expect(table).toHaveTextContent("ADMIN");
    expect(table).toHaveTextContent("MEMBER");
    fireEvent.click(screen.getAllByRole("button", { name: /Opções do registro/ })[1]);
    expect(screen.getAllByRole("button", { name: "Desativar acesso" })).toHaveLength(1);
  });

  it("offers to send the generated code to the guest by e-mail", async () => {
    vi.mocked(useActiveContext).mockReturnValue({
      loading: false,
      kind: "company",
      setKind: vi.fn(),
      company,
      isAdmin: true,
      hasCompany: true,
      isPlatformAdmin: false,
      can: () => true,
    });
    vi.mocked(managementService.listEmployees).mockResolvedValue([]);
    vi.mocked(managementService.generateAccessCode).mockResolvedValue({
      id: "code-1",
      companyId: "company-1",
      code: "ABC12345",
      status: "ACTIVE",
      expiresAt: "2027-01-01",
      position: memberPosition,
    });

    render(
      <MemoryRouter>
        <EmployeesPage />
      </MemoryRouter>,
    );
    await screen.findByText("Nenhum funcionário ainda.");
    fireEvent.click(screen.getByRole("button", { name: "Convidar funcionário" }));

    fireEvent.change(screen.getByLabelText("Cargo existente"), { target: { value: "member-position" } });
    fireEvent.change(screen.getByLabelText("E-mail do convidado (opcional)"), { target: { value: "novo@empresa.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Gerar código" }));

    const link = await screen.findByRole("link", { name: "Enviar por e-mail" });
    const url = new URL(link.getAttribute("href") ?? "");
    expect(url.pathname).toBe("novo@empresa.com");
    expect(url.searchParams.get("subject")).toBe("Convite para Solaria na Solaria");
    expect(url.searchParams.get("body")).toContain("ABC12345");
  });

  it("does not build a mailto link from an address that could inject headers", async () => {
    vi.mocked(useActiveContext).mockReturnValue({
      loading: false,
      kind: "company",
      setKind: vi.fn(),
      company,
      isAdmin: true,
      hasCompany: true,
      isPlatformAdmin: false,
      can: () => true,
    });
    vi.mocked(managementService.listEmployees).mockResolvedValue([]);
    vi.mocked(managementService.generateAccessCode).mockResolvedValue({
      id: "code-1",
      companyId: "company-1",
      code: "ABC12345",
      status: "ACTIVE",
      expiresAt: "2027-01-01",
      position: memberPosition,
    });

    render(
      <MemoryRouter>
        <EmployeesPage />
      </MemoryRouter>,
    );
    await screen.findByText("Nenhum funcionário ainda.");
    fireEvent.click(screen.getByRole("button", { name: "Convidar funcionário" }));

    fireEvent.change(screen.getByLabelText("Cargo existente"), { target: { value: "member-position" } });
    fireEvent.change(screen.getByLabelText("E-mail do convidado (opcional)"), { target: { value: "a&cc=x@b.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Gerar código" }));

    expect(await screen.findByText(/ABC12345/)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Enviar por e-mail" })).not.toBeInTheDocument();
  });

  it("lets a company admin invite another administrator", async () => {
    vi.mocked(useActiveContext).mockReturnValue({
      loading: false,
      kind: "company",
      setKind: vi.fn(),
      company,
      isAdmin: true,
      hasCompany: true,
      isPlatformAdmin: false,
      can: () => true,
    });
    vi.mocked(managementService.listEmployees).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <EmployeesPage />
      </MemoryRouter>,
    );
    await screen.findByText("Nenhum funcionário ainda.");
    fireEvent.click(screen.getByRole("button", { name: "Convidar funcionário" }));

    expect(screen.getByRole("option", { name: "ADMIN" })).toBeInTheDocument();
  });

  it("does not offer the administrator position to a non-admin who can invite", async () => {
    vi.mocked(useActiveContext).mockReturnValue({
      loading: false,
      kind: "company",
      setKind: vi.fn(),
      company,
      isAdmin: false,
      hasCompany: true,
      isPlatformAdmin: false,
      can: () => true,
    });
    vi.mocked(managementService.listEmployees).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <EmployeesPage />
      </MemoryRouter>,
    );
    await screen.findByText("Nenhum funcionário ainda.");
    fireEvent.click(screen.getByRole("button", { name: "Convidar funcionário" }));

    expect(screen.queryByRole("option", { name: "ADMIN" })).not.toBeInTheDocument();
  });
  it("cancels a filled invitation without generating a code", async () => {
    vi.mocked(useActiveContext).mockReturnValue({
      loading: false,
      kind: "company",
      setKind: vi.fn(),
      company,
      isAdmin: true,
      hasCompany: true,
      isPlatformAdmin: false,
      can: () => true,
    });
    vi.mocked(managementService.listEmployees).mockResolvedValue([]);
    render(
      <MemoryRouter>
        <EmployeesPage />
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Convidar funcion\u00e1rio" }));
    fireEvent.change(screen.getByLabelText("Cargo existente"), { target: { value: "member-position" } });
    fireEvent.click(screen.getByRole("button", { name: "cancelar" }));
    expect(managementService.generateAccessCode).not.toHaveBeenCalled();
    expect(screen.getByRole("table", { name: "Equipe" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Gerar c\u00f3digo" })).not.toBeInTheDocument();
  });
});
