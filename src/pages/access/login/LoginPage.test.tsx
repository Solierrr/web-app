import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import LoginPage from "./LoginPage";

vi.mock("@/features/access/access.service", () => ({
  login: vi.fn(),
}));

import { login } from "@/features/access/access.service";

const mockedLogin = vi.mocked(login);

describe("LoginPage", () => {
  beforeEach(() => {
    mockedLogin.mockReset();
  });

  it("renders the login form fields and submit button", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByPlaceholderText("seuemailaqui@email.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("suasenhaaqui")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Prosseguir" })).toBeInTheDocument();
  });

  it("links to the register and forgot-password routes", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Cadastre-se" })).toHaveAttribute("href", "/pt-BR/cadastro");
    expect(screen.getByRole("link", { name: "Esqueci minha senha" })).toHaveAttribute("href", "/pt-BR/esqueci-senha");
  });

  it("calls the login service with the entered credentials", async () => {
    mockedLogin.mockResolvedValue({
      accessToken: "token",
      refreshToken: "refresh",
      accessTokenExpiresAt: "2026-01-01T00:00:00Z",
      userId: "user-1",
      email: "user@solaria.com",
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("seuemailaqui@email.com"), { target: { value: "user@solaria.com" } });
    fireEvent.change(screen.getByPlaceholderText("suasenhaaqui"), { target: { value: "supersecret123" } });
    fireEvent.click(screen.getByRole("button", { name: "Prosseguir" }));

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith({ email: "user@solaria.com", password: "supersecret123" });
    });
  });

  it("shows an error message when login fails", async () => {
    mockedLogin.mockRejectedValue(new Error("invalid credentials"));

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("seuemailaqui@email.com"), { target: { value: "user@solaria.com" } });
    fireEvent.change(screen.getByPlaceholderText("suasenhaaqui"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: "Prosseguir" }));

    expect(await screen.findByText("E-mail ou senha inválidos")).toBeInTheDocument();
  });
});
