import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EmployeePage from "./EmployeePage";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { listEmployees } from "@/features/companies/company.management.service";

vi.mock("@@/layout/access/canvas/SideCanvas", () => ({ default: () => null }));
vi.mock("@/lib/shared/context/ActiveContext", () => ({ useActiveContext: vi.fn() }));
vi.mock("@/features/companies/company.management.service", () => ({ listEmployees: vi.fn() }));
vi.mock("@/features/users/user/user.service", () => ({ getUser: () => Promise.resolve({ username: "Funcionário" }) }));
vi.mock("@/features/permissions/Permissions", () => ({ default: () => <div>Editar permissões</div> }));

function page() {
  return (
    <MemoryRouter initialEntries={["/pt-BR/admin/funcionarios/employee"]}>
      <Routes>
        <Route path="/:lang/admin/funcionarios/:employeeId" element={<EmployeePage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("EmployeePage", () => {
  beforeEach(() => {
    vi.mocked(useActiveContext).mockReturnValue({ company: { id: "company", type: "SUPPLIER" }, can: () => true } as never);
  });

  it("waits for all employee details before showing the heading", async () => {
    vi.mocked(listEmployees).mockResolvedValue([{ id: "employee", userId: "user", position: { id: "position", name: "MEMBER" } }] as never);
    render(page());
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Funcionário" })).toBeInTheDocument();
    expect(screen.getByText("Editar permissões")).toBeInTheDocument();
  });

  it("does not expose permission editing for administrators", async () => {
    vi.mocked(listEmployees).mockResolvedValue([{ id: "employee", userId: "user", position: { id: "admin", name: "ADMIN" } }] as never);
    render(page());
    await screen.findByRole("heading", { name: "Funcionário" });
    expect(screen.queryByText("Editar permissões")).not.toBeInTheDocument();
  });
});
