import Toast from "@@/feedback/toast/Toast";
import { beforeEach as beforeToastTest } from "vitest";
beforeToastTest(() => {
  render(<Toast />);
});
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VerifyEmailPage from "./VerifyEmailPage";
import { confirmEmailVerification, getAccountIdentity, requestEmailVerification } from "@/features/access/access.credentials.service";

vi.mock("@/features/access/access.credentials.service", () => ({
  getAccountIdentity: vi.fn(),
  confirmEmailVerification: vi.fn(),
  requestEmailVerification: vi.fn(),
}));
vi.mock("@/config/mocks/mockMode.utils", () => ({ isAlwaysMockMode: () => false }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAccountIdentity).mockResolvedValue({ emailVerified: false } as never);
});

describe("VerifyEmailPage", () => {
  it("preserves delivery feedback from a completed registration", async () => {
    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/pt-BR/verificar-email", state: { verificationError: "O envio de e-mail está indisponível. Tente novamente mais tarde." } },
        ]}>
        <VerifyEmailPage />
      </MemoryRouter>,
    );
    expect(await screen.findByText("O envio de e-mail está indisponível", { exact: false })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar email de confirmação" })).toBeEnabled();
  });

  it("checks verification in api-auth and requests a confirmation email", async () => {
    vi.mocked(requestEmailVerification).mockResolvedValue(undefined);
    render(
      <MemoryRouter>
        <VerifyEmailPage />
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Enviar email de confirmação" }));
    await waitFor(() => expect(requestEmailVerification).toHaveBeenCalledOnce());
    expect(await screen.findByText("Solicitação recebida. Verifique sua caixa de entrada.", { exact: false })).toBeInTheDocument();
  });
  it("requires an explicit click before consuming the email token", async () => {
    vi.mocked(confirmEmailVerification).mockResolvedValue(undefined);
    render(
      <MemoryRouter initialEntries={["/pt-BR/verificar-email?token=one-time-proof"]}>
        <VerifyEmailPage />
      </MemoryRouter>,
    );
    const button = await screen.findByRole("button", { name: "Confirmar email" });
    expect(confirmEmailVerification).not.toHaveBeenCalled();
    vi.mocked(getAccountIdentity).mockResolvedValue({ emailVerified: true } as never);
    fireEvent.click(button);
    await waitFor(() => expect(confirmEmailVerification).toHaveBeenCalledWith("one-time-proof"));
    expect(await screen.findByRole("button", { name: "Continuar" })).toBeInTheDocument();
  });
  it("shows transport failure without claiming that an email was sent", async () => {
    vi.mocked(requestEmailVerification).mockRejectedValue(new Error("disabled"));
    render(
      <MemoryRouter>
        <VerifyEmailPage />
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Enviar email de confirmação" }));
    expect(await screen.findByText("O envio de email está indisponível", { exact: false })).toBeInTheDocument();
    expect(screen.queryByText("Solicitação recebida. Verifique sua caixa de entrada.")).not.toBeInTheDocument();
  });
});

vi.mock("@@/brand/logo/OrganicLogo", () => ({ default: () => <span role="img" aria-label="Solaria" /> }));
