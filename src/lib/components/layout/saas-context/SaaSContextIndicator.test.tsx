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

    expect(screen.getByText("Fornecedora ·").parentElement).toHaveTextContent("Fornecedora · Solar XPTO · Admin");
  });

  it("marks an employee access as access", () => {
    vi.mocked(useActiveContext).mockReturnValue({ ...base, kind: "company", company: { ...company, type: "DEMANDANT" } as never, isAdmin: false, isPlatformAdmin: false });

    render(<SaaSContextIndicator />);

    expect(screen.getByText("Demandante ·").parentElement).toHaveTextContent("Demandante · Solar XPTO · Acesso");
  });

  it("omits the type when the company has none", () => {
    vi.mocked(useActiveContext).mockReturnValue({ ...base, kind: "company", company: { id: "c1", tradeName: "Solar XPTO" } as never, isAdmin: true, isPlatformAdmin: false });

    render(<SaaSContextIndicator />);

    expect(screen.getByText("Solar XPTO").parentElement).toHaveTextContent("Solar XPTO · Admin");
  });

  it("shows the personal profile when the company is selected away", () => {
    vi.mocked(useActiveContext).mockReturnValue({ ...base, kind: "personal", company: company as never, isAdmin: true, isPlatformAdmin: true });

    render(<SaaSContextIndicator />);

    expect(screen.getByText("Admin Solaria")).toBeInTheDocument();
    expect(screen.queryByText("Solar XPTO")).not.toBeInTheDocument();
  });
});
