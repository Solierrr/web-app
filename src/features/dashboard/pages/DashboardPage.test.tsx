import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "./DashboardPage";
import { rememberPage } from "../dashboard.utils";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";

vi.mock("@/lib/shared/context/ActiveContext", () => ({ useActiveContext: vi.fn() }));

const supplier = { id: "c1", status: "APPROVED", type: "SUPPLIER", cnpj: "1", tradeName: "Solaria", corporateName: "Solaria Ltda", slug: "solaria" } as never;

function renderPage() {
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

describe("DashboardPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows a loading state", () => {
    vi.mocked(useActiveContext).mockReturnValue({ loading: true, kind: "personal", setKind: vi.fn(), company: null, isAdmin: false, hasCompany: false, isPlatformAdmin: false });

    renderPage();

    expect(screen.getByRole("status")).toHaveTextContent("Carregando área operacional...");
  });

  it("shows only the personal shortcuts when there is no company", () => {
    vi.mocked(useActiveContext).mockReturnValue({ loading: false, kind: "personal", setKind: vi.fn(), company: null, isAdmin: false, hasCompany: false, isPlatformAdmin: false });

    renderPage();

    expect(screen.getByText("O que você deseja fazer?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mensagens" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Ofertas" })).not.toBeInTheDocument();
    expect(screen.getByText("As telas visitadas aparecerão aqui.")).toBeInTheDocument();
  });

  it("shows the company shortcuts for a supplier company", () => {
    vi.mocked(useActiveContext).mockReturnValue({
      loading: false, kind: "company", setKind: vi.fn(), company: supplier, isAdmin: true, hasCompany: true, isPlatformAdmin: false, can: () => true,
    });

    renderPage();

    expect(screen.getByRole("link", { name: "Perfil da empresa" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ofertas" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Modelos de placas solares" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Assistente" })).toBeInTheDocument();
  });

  it("filters the shortcuts by the search query and reports when nothing matches", () => {
    vi.mocked(useActiveContext).mockReturnValue({
      loading: false, kind: "company", setKind: vi.fn(), company: supplier, isAdmin: true, hasCompany: true, isPlatformAdmin: false, can: () => true,
    });

    renderPage();
    const search = screen.getByPlaceholderText("Buscar uma tela");

    fireEvent.change(search, { target: { value: "ofertas" } });
    expect(screen.getByRole("link", { name: "Ofertas" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Mensagens" })).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: "inexistente" } });
    expect(screen.getByText("Nenhuma tela encontrada.")).toBeInTheDocument();
  });

  it("lists the recently visited screens", () => {
    rememberPage("c1", "offers");
    vi.mocked(useActiveContext).mockReturnValue({
      loading: false, kind: "company", setKind: vi.fn(), company: supplier, isAdmin: true, hasCompany: true, isPlatformAdmin: false, can: () => true,
    });

    renderPage();

    expect(screen.getAllByRole("link", { name: "Ofertas" })).toHaveLength(2);
    expect(screen.queryByText("As telas visitadas aparecerão aqui.")).not.toBeInTheDocument();
  });
});
