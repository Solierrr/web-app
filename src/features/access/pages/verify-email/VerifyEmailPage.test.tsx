import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import VerifyEmailPage from "./VerifyEmailPage";
import * as authService from "@/config/firebase/auth/auth.service";
import { linkFirebase } from "@/features/access/access.service";

vi.mock("@/config/firebase/auth/auth.service", () => ({
  getCurrentFirebaseUser: vi.fn(),
  reloadCurrentFirebaseUser: vi.fn(),
  sendVerificationEmail: vi.fn(),
}));
vi.mock("@/features/access/access.service", () => ({ linkFirebase: vi.fn() }));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => ({ email: "user@example.com" }) }));

describe("VerifyEmailPage", () => {
  it("shows the pending state with a resend button when the email is not verified yet", async () => {
    vi.mocked(authService.reloadCurrentFirebaseUser).mockResolvedValue({ email: "user@example.com", emailVerified: false } as never);

    render(<MemoryRouter><VerifyEmailPage /></MemoryRouter>);

    expect(await screen.findByRole("button", { name: "Reenviar e-mail" })).toBeInTheDocument();
  });

  it("shows the password confirmation form once the email is verified", async () => {
    vi.mocked(authService.reloadCurrentFirebaseUser).mockResolvedValue({ email: "user@example.com", emailVerified: true } as never);

    render(<MemoryRouter><VerifyEmailPage /></MemoryRouter>);

    expect(await screen.findByRole("button", { name: "Confirmar" })).toBeInTheDocument();
  });

  it("links the account after submitting the password", async () => {
    const getIdToken = vi.fn().mockResolvedValue("id-token");
    vi.mocked(authService.reloadCurrentFirebaseUser).mockResolvedValue({ email: "user@example.com", emailVerified: true } as never);
    vi.mocked(authService.getCurrentFirebaseUser).mockReturnValue({ email: "user@example.com", getIdToken } as never);
    vi.mocked(linkFirebase).mockResolvedValue({} as never);

    render(<MemoryRouter><VerifyEmailPage /></MemoryRouter>);
    await screen.findByRole("button", { name: "Confirmar" });

    const passwordInput = document.querySelector<HTMLInputElement>("input[type='password']");
    fireEvent.change(passwordInput!, { target: { value: "current-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() => expect(linkFirebase).toHaveBeenCalledWith("user@example.com", "current-password", "id-token"));
    expect(await screen.findByRole("status")).toBeInTheDocument();
  });

  it("shows a fallback message when there is no firebase account to verify", async () => {
    vi.mocked(authService.reloadCurrentFirebaseUser).mockResolvedValue(null);

    render(<MemoryRouter><VerifyEmailPage /></MemoryRouter>);

    expect(await screen.findByText(/Não encontramos uma verificação em andamento/)).toBeInTheDocument();
  });
});
