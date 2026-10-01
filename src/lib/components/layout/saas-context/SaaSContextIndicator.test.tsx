import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SaaSContextIndicator from "./SaaSContextIndicator";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";

vi.mock("@/lib/shared/context/ActiveContext", () => ({ useActiveContext: vi.fn() }));

const base = { loading: false, setKind: vi.fn(), hasCompany: false };
const company = { id: "c1", type: "SUPPLIER", tradeName: "Solar XPTO" };

describe("SaaSContextIndicator", () => {
  it("shows the personal profile outside a company", () => {
    vi.mocked(useActiveContext).mockReturnValue({ ...base, kind: "personal", company: null, isAdmin: false, isPlatformAdmin: false });

    render(<SaaSContextIndicator />);

    expect(screen.getByText("Perfil pessoal")).toBeInTheDocument();
  });

  it("shows the platform scope for a Solaria admin without a company", () => {
    vi.mocked(useActiveContext).mockReturnValue({ ...base, kind: "personal", company: null, isAdmin: false, isPlatformAdmin: true });

    render(<SaaSContextIndicator />);

    expect(screen.getByText("Admin Solaria")).toBeInTheDocument();
  });

  it("shows the company type, name and role for a company admin", () => {
    vi.mocked(useActiveContext).mockReturnValue({ ...base, kind: "company", company: company as never, isAdmin: true, isPlatformAdmin: false });

    render(<SaaSContextIndicator />);

    expect(screen.getByText("Fornecedora · Solar XPTO · Admin")).toBeInTheDocument();
  });

  it("marks an employee access as access", () => {
    vi.mocked(useActiveContext).mockReturnValue({ ...base, kind: "company", company: { ...company, type: "DEMANDANT" } as never, isAdmin: false, isPlatformAdmin: false });

    render(<SaaSContextIndicator />);

    expect(screen.getByText("Demandante · Solar XPTO · Acesso")).toBeInTheDocument();
  });
});
