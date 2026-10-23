import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import StatusPage from "./StatusPage";
import ActionLink from "@@/ui/button/ActionLink";

vi.mock("@@/layout/access/canvas/SideCanvas", () => ({ default: () => null }));
vi.mock("@@/brand/logo/OrganicLogo", () => ({ default: () => <span role="img" aria-label="Solaria" /> }));

describe("StatusPage", () => {
  it("shows the logo, title, message and stacked full-width actions", () => {
    render(
      <MemoryRouter>
        <StatusPage
          title="Entrar no Solaria Mobile"
          message="Mensagem de apoio"
          actions={
            <>
              <button type="button">Continuar</button>
              <ActionLink content="Concluir cadastro" description="Concluir cadastro" to="/cadastro" variant="surface" />
            </>
          }>
          <p>Conteúdo extra</p>
        </StatusPage>
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Entrar no Solaria Mobile" })).toBeInTheDocument();
    expect(screen.getByText("Mensagem de apoio")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo extra")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Solaria" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar" }).parentElement).toHaveClass("flex-col", "max-w-80");
    expect(screen.getByRole("link", { name: "Concluir cadastro" })).toHaveAttribute("href", "/cadastro");
  });

  it("marks the page as busy and omits optional blocks when not provided", () => {
    const { container } = render(<StatusPage title="Carregando" busy />);
    expect(container.querySelector("main")).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector("p")).toBeNull();
    expect(container.querySelector("button")).toBeNull();
  });
});
