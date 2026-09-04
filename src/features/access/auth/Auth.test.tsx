import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Auth from "./Auth";
import { useAuth } from "./Auth.utils";

function Probe() {
  const { authenticated, login, logout } = useAuth();

  return (
    <div>
      <span>{authenticated ? "logado" : "deslogado"}</span>
      <button type="button" onClick={() => login({ id: "1", name: "Ana", email: "ana@inter.com" })}>
        entrar
      </button>
      <button type="button" onClick={logout}>
        sair
      </button>
    </div>
  );
}

describe("Auth", () => {
  it("starts unauthenticated", () => {
    render(
      <Auth>
        <Probe />
      </Auth>,
    );

    expect(screen.getByText("deslogado")).toBeInTheDocument();
  });

  it("becomes authenticated after login", () => {
    render(
      <Auth>
        <Probe />
      </Auth>,
    );

    fireEvent.click(screen.getByRole("button", { name: "entrar" }));

    expect(screen.getByText("logado")).toBeInTheDocument();
  });

  it("becomes unauthenticated again after logout", () => {
    render(
      <Auth>
        <Probe />
      </Auth>,
    );

    fireEvent.click(screen.getByRole("button", { name: "entrar" }));
    fireEvent.click(screen.getByRole("button", { name: "sair" }));

    expect(screen.getByText("deslogado")).toBeInTheDocument();
  });

  it("throws when useAuth is called outside the provider", () => {
    expect(() => render(<Probe />)).toThrow(/useAuth/);
  });
});
