import Toast from "@@/feedback/toast/Toast";
import { beforeEach as beforeToastTest } from "vitest";
beforeToastTest(() => {
  render(<Toast />);
});
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import RegisterPage from "./RegisterPage";
import { HttpResponseError } from "@/lib/shared/http/http.service";
vi.mock("@/features/access/access.credentials.service", () => ({ requestEmailVerification: vi.fn().mockResolvedValue(undefined) }));

vi.mock("@/features/access/access.service", () => ({
  register: vi.fn(),
  login: vi.fn(),
}));

import { login, register } from "@/features/access/access.service";

const mockedRegister = vi.mocked(register);
const mockedLogin = vi.mocked(login);

function fillForm({ password, confirmPassword }: { password: string; confirmPassword: string }) {
  fireEvent.change(screen.getByPlaceholderText("Insira seu e-mail aqui"), { target: { value: "user@solaria.com" } });
  fireEvent.change(screen.getByPlaceholderText("Crie uma senha"), { target: { value: password } });
  fireEvent.change(screen.getByPlaceholderText("Repita sua senha novamente"), { target: { value: confirmPassword } });
  fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));
}

describe("RegisterPage", () => {
  it("retries sign-in without registering again after partial success", async () => {
    mockedRegister.mockResolvedValue({ id: "user-1", email: "user@solaria.com", message: "Created" });
    mockedLogin.mockRejectedValue(new Error("unavailable", { cause: new HttpResponseError(503, "HTTP_ERROR") }));
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );
    fillForm({ password: "supersecret123", confirmPassword: "supersecret123" });
    expect(await screen.findByText("temporariamente indisponível", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Sua conta foi criada", { exact: false })).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() => expect(mockedLogin).toHaveBeenCalledTimes(2));
    expect(mockedRegister).toHaveBeenCalledOnce();
  });

  beforeEach(() => {
    vi.stubEnv("VITE_MOCKS", "DEACTIVATED");
    vi.stubEnv("VITE_AUTH_MOCKS", "DEACTIVATED");
    mockedRegister.mockReset();
    mockedLogin.mockReset();
  });

  it("renders the register form fields and submit button", () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    expect(screen.getByPlaceholderText("Insira seu e-mail aqui")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Crie uma senha")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Repita sua senha novamente")).toBeInTheDocument();
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

    expect(screen.getByText("As senhas não coincidem", { exact: false })).toBeInTheDocument();
    expect(mockedRegister).not.toHaveBeenCalled();
  });
});

vi.mock("@@/brand/logo/OrganicLogo", () => ({ default: () => <span role="img" aria-label="Solaria" /> }));
