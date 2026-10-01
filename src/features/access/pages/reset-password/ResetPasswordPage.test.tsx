import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ResetPasswordPage from "./ResetPasswordPage";
import { completePasswordReset } from "@/config/firebase/auth/auth.service";

vi.mock("@/config/firebase/auth/auth.service", () => ({ completePasswordReset: vi.fn() }));

function renderPage(search = "?oobCode=abc") {
  render(
    <MemoryRouter initialEntries={[`/pt-BR/redefinir-senha${search}`]}>
      <ResetPasswordPage />
    </MemoryRouter>,
  );
}

function fill(password: string, confirmation: string) {
  fireEvent.change(screen.getByPlaceholderText("suasenhaaqui"), { target: { value: password } });
  fireEvent.change(screen.getByPlaceholderText("confirmesuasenha"), { target: { value: confirmation } });
  fireEvent.click(screen.getByRole("button", { name: "Redefinir senha" }));
}

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_MOCKS", "DEACTIVATED");
    vi.mocked(completePasswordReset).mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("asks for a new link when the reset code is missing", () => {
    renderPage("");

    expect(screen.getByRole("alert")).toHaveTextContent("Este link de redefinição é inválido ou expirou.");
    expect(screen.getByRole("link", { name: "Solicitar novo link" })).toHaveAttribute("href", "/pt-BR/esqueci-senha");
  });

  it("does not call the service when the passwords differ", () => {
    renderPage();

    fill("senha-muito-segura-1", "senha-muito-segura-2");

    expect(screen.getByRole("alert")).toHaveTextContent("As senhas não conferem.");
    expect(completePasswordReset).not.toHaveBeenCalled();
  });

  it("resets the password with the code from the link and offers the login", async () => {
    vi.mocked(completePasswordReset).mockResolvedValue(undefined);
    renderPage();

    fill("senha-muito-segura-1", "senha-muito-segura-1");

    await waitFor(() => expect(completePasswordReset).toHaveBeenCalledWith("abc", "senha-muito-segura-1"));
    expect(await screen.findByRole("status")).toHaveTextContent("Senha redefinida");
    expect(screen.getByRole("link", { name: "Voltar para o login" })).toHaveAttribute("href", "/pt-BR/login");
  });

  it("shows an error when the service rejects the code", async () => {
    vi.mocked(completePasswordReset).mockRejectedValue(new Error("expired"));
    renderPage();

    fill("senha-muito-segura-1", "senha-muito-segura-1");

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível redefinir a senha");
  });
});
