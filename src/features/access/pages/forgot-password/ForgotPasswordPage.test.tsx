import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import ForgotPasswordPage from "./ForgotPasswordPage";
import { requestPasswordReset } from "@/config/firebase/auth/auth.service";

vi.mock("@/config/firebase/auth/auth.service", () => ({ requestPasswordReset: vi.fn() }));

describe("ForgotPasswordPage", () => {
  it("renders the email field and submit button", () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    );

    expect(screen.getByPlaceholderText("seuemailaqui@email.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar" })).toBeInTheDocument();
  });

  it("links back to the login route", () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Voltar para o login" })).toHaveAttribute("href", "/pt-BR/login");
  });

  it("sends a firebase password reset email and shows a confirmation", async () => {
    vi.mocked(requestPasswordReset).mockResolvedValue(undefined);
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("seuemailaqui@email.com"), { target: { value: "user@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    await waitFor(() => expect(requestPasswordReset).toHaveBeenCalledWith("user@example.com"));
    expect(await screen.findByRole("status")).toBeInTheDocument();
  });

  it("shows an error when the reset request fails", async () => {
    vi.mocked(requestPasswordReset).mockRejectedValue(new Error("offline"));
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("seuemailaqui@email.com"), { target: { value: "user@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByText("Não foi possível enviar o e-mail de recuperação. Tente novamente.")).toBeInTheDocument();
  });
});
