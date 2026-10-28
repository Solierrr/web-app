import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ProfessionalProfile from "./ProfessionalProfile";

vi.mock("@/features/professionals/professional.service", () => ({
  getCatalogTechnicianBySlug: vi.fn(),
}));

import { getCatalogTechnicianBySlug, type CatalogTechnician } from "@/features/professionals/professional.service";

const mockedGetCatalogTechnicianBySlug = vi.mocked(getCatalogTechnicianBySlug);

const professional: CatalogTechnician = {
  id: "professional-1",
  name: "Carlos Eduardo Lima",
  slug: "carlos-eduardo-lima",
  crea: "MG-123456",
  professions: ["Engenheiro Eletricista"],
};

describe("ProfessionalProfile", () => {
  it("uses public contact details when available and shows an honest unavailable state otherwise", async () => {
    mockedGetCatalogTechnicianBySlug.mockResolvedValue({ ...professional, contact: { email: "ana@example.test", number: "+55 (11) 99999-1234" } });
    render(
      <MemoryRouter>
        <ProfessionalProfile />
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Entrar em contato" }));
    expect(await screen.findByRole("link", { name: "Enviar e-mail" })).toHaveAttribute("href", "mailto:ana%40example.test");
    expect(screen.getByRole("link", { name: "Ligar" })).toHaveAttribute("href", "tel:+5511999991234");
    expect(screen.queryByText("Este profissional ainda não disponibilizou contato público.")).not.toBeInTheDocument();
  });
  beforeEach(() => {
    mockedGetCatalogTechnicianBySlug.mockReset();
  });

  it("renders a skeleton while the professional is loading", () => {
    mockedGetCatalogTechnicianBySlug.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <ProfessionalProfile />
      </MemoryRouter>,
    );

    expect(screen.queryByText("Carlos Eduardo Lima")).not.toBeInTheDocument();
  });

  it("renders the mocked professional once loaded", async () => {
    mockedGetCatalogTechnicianBySlug.mockResolvedValue(professional);

    render(
      <MemoryRouter>
        <ProfessionalProfile />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Carlos Eduardo Lima" })).toBeInTheDocument();
    expect(screen.getByText("Engenheiro Eletricista")).toBeInTheDocument();
    expect(screen.getByText("CREA MG-123456")).toBeInTheDocument();
  });

  it("shows an error message when loading fails", async () => {
    mockedGetCatalogTechnicianBySlug.mockRejectedValue(new Error("not found"));

    render(
      <MemoryRouter>
        <ProfessionalProfile />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
  it("opens contact directly from the catalog hash and can reopen after dismissal", async () => {
    mockedGetCatalogTechnicianBySlug.mockResolvedValue(professional);
    render(
      <MemoryRouter initialEntries={["/pt-BR/profissional/carlos-eduardo-lima#contato"]}>
        <ProfessionalProfile />
      </MemoryRouter>,
    );
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Este profissional ainda não disponibilizou contato público.")).toBeInTheDocument();
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Entrar em contato" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
  it("shows each registration as a badge under the name", async () => {
    mockedGetCatalogTechnicianBySlug.mockResolvedValue({
      ...professional,
      registrations: [{ profession: "Engenheiro Eletricista", council: "CREA-MG", number: "123456", expirationDate: "2027-03-01" }],
    });
    render(
      <MemoryRouter>
        <ProfessionalProfile />
      </MemoryRouter>,
    );
    expect(await screen.findByText("CREA-MG 123456")).toBeInTheDocument();
  });
  it("shows the about section and offers to add the professional as a connection", async () => {
    mockedGetCatalogTechnicianBySlug.mockResolvedValue({ ...professional, userId: "user-9", about: "Atendo projetos residenciais." });
    render(
      <MemoryRouter>
        <ProfessionalProfile />
      </MemoryRouter>,
    );
    expect(await screen.findByRole("heading", { name: "Sobre mim" })).toBeInTheDocument();
    expect(screen.getByText("Atendo projetos residenciais.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Adicionar conexão" })).toBeEnabled();
  });
});
