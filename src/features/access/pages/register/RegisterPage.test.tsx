import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import RegisterPage from "./RegisterPage";

vi.mock("@/features/access/access.service", () => ({
  register: vi.fn(),
  login: vi.fn(),
}));

import { login, register } from "@/features/access/access.service";

const mockedRegister = vi.mocked(register);
const mockedLogin = vi.mocked(login);

function fillForm({ password, confirmPassword }: { password: string; confirmPassword: string }) {
  fireEvent.change(screen.getByPlaceholderText("seunomeaqui"), { target: { value: "Fulano" } });
  fireEvent.change(screen.getByPlaceholderText("seuemailaqui@email.com"), { target: { value: "user@solaria.com" } });
  fireEvent.change(screen.getByPlaceholderText("suasenhaaqui"), { target: { value: password } });
  fireEvent.change(screen.getByPlaceholderText("confirmesuasenha"), { target: { value: confirmPassword } });
  fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));
}

describe("RegisterPage", () => {
  beforeEach(() => {
    mockedRegister.mockReset();
    mockedLogin.mockReset();
  });

  it("renders the register form fields and submit button", () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    expect(screen.getByPlaceholderText("seunomeaqui")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("seuemailaqui@email.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("suasenhaaqui")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("confirmesuasenha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cadastrar" })).toBeInTheDocument();
  });

  it("links back to the login route", () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/pt-BR/login");
  });

  it("registers and logs in with the entered credentials when passwords match", async () => {
    mockedRegister.mockResolvedValue({ id: "user-1", email: "user@solaria.com", message: "User registered" });
    mockedLogin.mockResolvedValue({
      accessToken: "token",
      refreshToken: "refresh",
      accessTokenExpiresAt: "2026-01-01T00:00:00Z",
      userId: "user-1",
      email: "user@solaria.com",
    });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    fillForm({ password: "supersecret123", confirmPassword: "supersecret123" });

    await waitFor(() => {
      expect(mockedRegister).toHaveBeenCalledWith({ email: "user@solaria.com", password: "supersecret123" });
      expect(mockedLogin).toHaveBeenCalledWith({ email: "user@solaria.com", password: "supersecret123" });
    });
  });

  it("shows an error and does not call the service when passwords do not match", () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    fillForm({ password: "supersecret123", confirmPassword: "different123" });

    expect(screen.getByText("As senhas não coincidem")).toBeInTheDocument();
    expect(mockedRegister).not.toHaveBeenCalled();
  });
});
