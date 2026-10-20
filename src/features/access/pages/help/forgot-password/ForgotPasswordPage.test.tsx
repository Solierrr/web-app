import Toast from "@@/feedback/toast/Toast";
import { beforeEach as beforeToastTest } from "vitest";
beforeToastTest(() => {
  render(<Toast />);
});
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ForgotPasswordPage from "./ForgotPasswordPage";
import { requestPasswordReset } from "@/features/access/access.credentials.service";

vi.mock("@/features/access/access.credentials.service", () => ({ requestPasswordReset: vi.fn() }));

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_MOCKS", "DEACTIVATED");
    vi.stubEnv("VITE_AUTH_MOCKS", "DEACTIVATED");
    vi.clearAllMocks();
  });
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

  it("requests an internal password reset email and shows a confirmation", async () => {
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

vi.mock("@@/brand/logo/OrganicLogo", () => ({ default: () => <span role="img" aria-label="Solaria" /> }));
