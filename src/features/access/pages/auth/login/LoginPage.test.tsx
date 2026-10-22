import Toast from "@@/feedback/toast/Toast";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import LoginPage from "./LoginPage";
import { HttpResponseError } from "@/lib/shared/http/http.service";
import { login as loginFirebase, loginWithGoogle, loginWithMicrosoft } from "@/config/firebase/auth/auth.service";
import ForgotPasswordPage from "../../help/forgot-password/ForgotPasswordPage";

vi.mock("@@/layout/access/canvas/SideCanvas", () => ({ default: () => null }));

vi.mock("@/features/access/access.service", () => ({
  login: vi.fn(),
  loginWithFirebase: vi.fn(),
  linkFirebase: vi.fn(),
}));
vi.mock("@/config/firebase/auth/auth.service", () => ({
  login: vi.fn().mockRejectedValue(Object.assign(new Error("invalid credentials"), { code: "auth/invalid-credential" })),
  loginWithGoogle: vi.fn(async () => ({ email: "saved@example.com", getIdToken: async () => "id-token" })),
  loginWithMicrosoft: vi.fn(async () => ({ email: "saved@example.com", getIdToken: async () => "id-token" })),
}));

import { getRememberedLogin, saveRememberedLogin } from "./LoginPage.utils";
import { login, loginWithFirebase, linkFirebase } from "@/features/access/access.service";

const mockedLogin = vi.mocked(login);

describe("LoginPage", () => {
  it("clears pending account linking when returning to a saved password account", async () => {
    saveRememberedLogin({ email: "saved@example.com", method: "password" });
    vi.mocked(loginWithFirebase).mockRejectedValue(new Error("link required", { cause: new HttpResponseError(409, "ACCOUNT_LINK_REQUIRED") }));
    mockedLogin.mockResolvedValue({
      accessToken: "token",
      refreshToken: "refresh",
      accessTokenExpiresAt: "2027-01-01T00:00:00Z",
      userId: "user-1",
      email: "saved@example.com",
    });
    render(
      <MemoryRouter initialEntries={["/pt-BR/login?step=signin"]}>
        <LoginPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Continuar com Google" }));
    expect(await screen.findByRole("checkbox")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "Voltar às opções" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar como saved@example.com" }));
    expect(screen.getByLabelText("E-mail")).not.toHaveAttribute("readonly");
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "secure-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() => expect(mockedLogin).toHaveBeenCalledWith({ email: "saved@example.com", password: "secure-password" }));
    expect(linkFirebase).not.toHaveBeenCalled();
  });

  it("preserves the original destination through password recovery and back", async () => {
    mockedLogin.mockResolvedValue({
      accessToken: "token",
      refreshToken: "refresh",
      accessTokenExpiresAt: "2027-01-01T00:00:00Z",
      userId: "user-1",
      email: "user@example.com",
    });
    render(
      <MemoryRouter initialEntries={[{ pathname: "/pt-BR/login", search: "?step=signin", state: { returnTo: "/pt-BR/private" } }]}>
        <Routes>
          <Route path="/pt-BR/login" element={<LoginPage />} />
          <Route path="/pt-BR/esqueci-senha" element={<ForgotPasswordPage />} />
          <Route path="/pt-BR/private" element={<p>Destino original</p>} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("link", { name: "Esqueci minha senha" }));
    fireEvent.click(screen.getByRole("link", { name: "Voltar para o login" }));
    fireEvent.click(screen.getByRole("button", { name: "Já tenho uma conta" }));
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "secure-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText("Destino original")).toBeInTheDocument();
  });
  it("asks what to do before showing a form and lets the user return to the choices", () => {
    render(
      <MemoryRouter initialEntries={["/pt-BR/login"]}>
        <LoginPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Como você quer continuar?" })).toBeInTheDocument();
    expect(screen.queryByLabelText("E-mail")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Quero criar uma conta" })).toHaveAttribute("href", "/pt-BR/cadastro");
    expect(screen.queryByRole("link", { name: "Esqueci minha senha" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Já tenho uma conta" }));
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Esqueci minha senha" })).toHaveAttribute("href", "/pt-BR/esqueci-senha");
    fireEvent.click(screen.getByRole("button", { name: "Voltar às opções" }));
    expect(screen.queryByLabelText("E-mail")).not.toBeInTheDocument();
  });

  it("preserves the destination through the choice and remembers only successful access", async () => {
    mockedLogin.mockResolvedValue({
      accessToken: "token",
      refreshToken: "refresh",
      accessTokenExpiresAt: "2027-01-01T00:00:00Z",
      userId: "user-1",
      email: "user@example.com",
    });
    render(
      <MemoryRouter initialEntries={[{ pathname: "/pt-BR/login", state: { returnTo: "/pt-BR/private" } }]}>
        <Routes>
          <Route path="/pt-BR/login" element={<LoginPage />} />
          <Route path="/pt-BR/private" element={<p>Destino original</p>} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Já tenho uma conta" }));
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "secure-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText("Destino original")).toBeInTheDocument();
    expect(getRememberedLogin()).toEqual({ email: "user@example.com", method: "password" });
    expect(localStorage.getItem("solaria.login.remembered")).not.toContain("secure-password");
  });

  it.each(["google", "microsoft"] as const)("offers the last %s sign-in without authenticating automatically", async (method) => {
    saveRememberedLogin({ email: "saved@example.com", method });
    vi.mocked(loginWithFirebase).mockResolvedValue({
      accessToken: "token",
      refreshToken: "refresh",
      accessTokenExpiresAt: "2027-01-01T00:00:00Z",
      userId: "user-1",
      email: "saved@example.com",
    });
    render(
      <MemoryRouter initialEntries={["/pt-BR/login"]}>
        <LoginPage />
      </MemoryRouter>,
    );
    expect(loginWithGoogle).not.toHaveBeenCalled();
    expect(loginWithMicrosoft).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Continuar como saved@example.com" }));
    await waitFor(() => expect(loginWithFirebase).toHaveBeenCalledWith("id-token"));
    expect(method === "google" ? loginWithGoogle : loginWithMicrosoft).toHaveBeenCalledWith("saved@example.com");
    await waitFor(() => expect(getRememberedLogin()?.method).toBe(method));
  });

  it("forgets a saved account without starting authentication", () => {
    saveRememberedLogin({ email: "saved@example.com", method: "google" });
    render(
      <MemoryRouter initialEntries={["/pt-BR/login"]}>
        <LoginPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Esquecer esta conta neste dispositivo" }));
    expect(getRememberedLogin()).toBeNull();
    expect(loginWithGoogle).not.toHaveBeenCalled();
    expect(screen.queryByText("Último acesso")).not.toBeInTheDocument();
  });

  it.each([
    ["password", "Entrar com e-mail"],
    ["google", "Entrar com Google"],
    ["microsoft", "Entrar com Microsoft"],
  ] as const)("names the %s method in the remembered account button instead of a loose last-used line", (method, label) => {
    saveRememberedLogin({ email: "saved@example.com", method });
    render(
      <MemoryRouter initialEntries={["/pt-BR/login"]}>
        <LoginPage />
      </MemoryRouter>,
    );
    const button = screen.getByRole("button", { name: "Continuar como saved@example.com" });
    expect(button).toHaveTextContent(label);
    expect(button).toHaveTextContent("saved@example.com");
    expect(screen.queryByText(/Último acesso/)).not.toBeInTheDocument();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    saveRememberedLogin(null);
  });
  beforeEach(() => {
    render(<Toast />);
    mockedLogin.mockReset();
    vi.mocked(loginWithFirebase).mockReset();
    vi.mocked(loginWithGoogle).mockClear();
    vi.mocked(loginWithMicrosoft).mockClear();
    vi.mocked(linkFirebase).mockClear();
    saveRememberedLogin(null);
    vi.stubEnv("VITE_AUTH_MOCKS", "DEACTIVATED");
    vi.mocked(loginFirebase).mockClear();
  });

  it("renders the login form fields and submit button", () => {
    render(
      <MemoryRouter initialEntries={["/pt-BR/login?step=signin"]}>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByPlaceholderText("Insira seu e-mail aqui")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Insira sua senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Que bom ter você por aqui" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: /Lembrar meu e-mail/ })).not.toBeInTheDocument();
  });

  it("links to basic registration and forgot-password routes", () => {
    render(
      <MemoryRouter initialEntries={["/pt-BR/login?step=signin"]}>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Cadastre-se" })).toHaveAttribute("href", "/pt-BR/cadastro");
    expect(screen.getByRole("link", { name: "Esqueci minha senha" })).toHaveAttribute("href", "/pt-BR/esqueci-senha");
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
    const policies = screen.getByRole("button", { name: /Consulte as políticas/ });
    fireEvent.click(policies);
    expect(screen.getByRole("menuitem", { name: "Termos de uso" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Política de privacidade" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Política de cookies" })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(policies).toHaveFocus();
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
      <MemoryRouter initialEntries={["/pt-BR/login?step=signin"]}>
        <LoginPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("Insira seu e-mail aqui"), { target: { value: "user@solaria.com" } });
    fireEvent.change(screen.getByPlaceholderText("Insira sua senha"), { target: { value: "supersecret123" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith({ email: "user@solaria.com", password: "supersecret123" });
    });
  });

  it("shows an error message when login fails", async () => {
    mockedLogin.mockRejectedValue(new Error("authentication failed", { cause: new HttpResponseError(401, "INVALID_CREDENTIALS") }));

    render(
      <MemoryRouter initialEntries={["/pt-BR/login?step=signin"]}>
        <LoginPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("Insira seu e-mail aqui"), { target: { value: "user@solaria.com" } });
    fireEvent.change(screen.getByPlaceholderText("Insira sua senha"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("E-mail ou senha inválidos")).toBeInTheDocument();
  });

  it.each([
    [new Error("upstream down", { cause: new HttpResponseError(503, "INTERNAL_ERROR") }), /temporariamente indisponível/],
    [new Error("network", { cause: new TypeError("Failed to fetch") }), /Verifique sua conexão/],
    [new Error("rate limited", { cause: new HttpResponseError(429, "HTTP_ERROR") }), /Muitas tentativas/],
  ])("shows service feedback without attempting legacy authentication", async (failure, message) => {
    mockedLogin.mockRejectedValue(failure);
    render(
      <MemoryRouter initialEntries={["/pt-BR/login?step=signin"]}>
        <LoginPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "user@solaria.com" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByRole("status")).toHaveTextContent(message);
    expect(loginFirebase).not.toHaveBeenCalled();
    expect(getRememberedLogin()).toBeNull();
  });
});

vi.mock("@@/brand/logo/OrganicLogo", () => ({ default: () => <span role="img" aria-label="Solaria" /> }));
