import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ActiveContextProvider, useActiveContext } from "./ActiveContext";
import { getMyCompany, getMyMembership } from "@/features/companies/company.service";
import { getMyPlatformAdmin } from "@/features/platform-admin/platformAdmin.service";

vi.mock("@/features/companies/company.service", () => ({
  getMyCompany: vi.fn(),
  getMyMembership: vi.fn(),
}));

vi.mock("@/features/platform-admin/platformAdmin.service", () => ({
  getMyPlatformAdmin: vi.fn(),
}));

function Probe() {
  const context = useActiveContext();
  return (
    <div>
      <p>kind: {context.kind}</p>
      <p>isAdmin: {String(context.isAdmin)}</p>
      <p>hasCompany: {String(context.hasCompany)}</p>
      <p>isPlatformAdmin: {String(context.isPlatformAdmin)}</p>
      <button type="button" onClick={() => context.setKind("personal")}>go personal</button>
    </div>
  );
}

describe("ActiveContextProvider", () => {
  it("defaults to the personal context when the user has no company", async () => {
    vi.mocked(getMyMembership).mockResolvedValue(null);
    vi.mocked(getMyCompany).mockResolvedValue(null);
    vi.mocked(getMyPlatformAdmin).mockResolvedValue(null);

    render(<ActiveContextProvider><Probe /></ActiveContextProvider>);

    await waitFor(() => expect(screen.getByText("kind: personal")).toBeInTheDocument());
    expect(screen.getByText("hasCompany: false")).toBeInTheDocument();
  });

  it("defaults to the company context and flags admins when the user has a company", async () => {
    vi.mocked(getMyMembership).mockResolvedValue({ companyId: "company-1", position: { id: "position-1", name: "ADMIN" } });
    vi.mocked(getMyCompany).mockResolvedValue({ id: "company-1", status: "APPROVED", type: "SUPPLIER", cnpj: "1", tradeName: "Solaria", corporateName: "Solaria Ltda", slug: "solaria" } as never);
    vi.mocked(getMyPlatformAdmin).mockResolvedValue(null);

    render(<ActiveContextProvider><Probe /></ActiveContextProvider>);

    await waitFor(() => expect(screen.getByText("kind: company")).toBeInTheDocument());
    expect(screen.getByText("isAdmin: true")).toBeInTheDocument();
  });

  it("flags platform admins", async () => {
    vi.mocked(getMyMembership).mockResolvedValue(null);
    vi.mocked(getMyCompany).mockResolvedValue(null);
    vi.mocked(getMyPlatformAdmin).mockResolvedValue({ id: "admin-1", userId: "user-1" });

    render(<ActiveContextProvider><Probe /></ActiveContextProvider>);

    await waitFor(() => expect(screen.getByText("isPlatformAdmin: true")).toBeInTheDocument());
  });

  it("lets the user switch to the personal context", async () => {
    vi.mocked(getMyMembership).mockResolvedValue({ companyId: "company-1", position: { id: "position-1", name: "EMPLOYEE" } });
    vi.mocked(getMyCompany).mockResolvedValue({ id: "company-1", status: "APPROVED", type: "SUPPLIER", cnpj: "1", tradeName: "Solaria", corporateName: "Solaria Ltda", slug: "solaria" } as never);
    vi.mocked(getMyPlatformAdmin).mockResolvedValue(null);

    render(<ActiveContextProvider><Probe /></ActiveContextProvider>);
    await waitFor(() => expect(screen.getByText("kind: company")).toBeInTheDocument());
    expect(screen.getByText("isAdmin: false")).toBeInTheDocument();

    act(() => { screen.getByRole("button", { name: "go personal" }).click(); });
    expect(await screen.findByText("kind: personal")).toBeInTheDocument();
  });
});
