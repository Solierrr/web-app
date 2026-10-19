import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Mobile from "./Mobile";
import { authorizeMobile, cancelMobile, inspectMobile } from "./mobile.service";

vi.mock("./mobile.service", () => ({
  inspectMobile: vi.fn(),
  authorizeMobile: vi.fn(),
  cancelMobile: vi.fn(),
  MobileFlowError: class extends Error {},
}));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => ({ accessToken: "web-session", email: "user@example.com" }) }));
vi.mock("@/features/access/access.service", () => ({ logout: vi.fn() }));
const id = "t".repeat(43);
function renderPage() {
  render(
    <MemoryRouter initialEntries={[`/pt-BR/auth/mobile?transaction=${id}`]}>
      <Routes>
        <Route path="/:lang/auth/mobile" element={<Mobile />} />
      </Routes>
    </MemoryRouter>,
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(inspectMobile).mockResolvedValue({
    transactionId: id,
    clientId: "solaria-mobile",
    expiresAt: "2099-01-01T00:00:00Z",
    email: "user@example.com",
    emailVerified: true,
    eligible: true,
    reasons: [],
  });
});
describe("Mobile", () => {
  it("does not authorize a logged-in account without explicit confirmation", async () => {
    renderPage();
    expect(await screen.findByRole("button", { name: "Continuar como user@example.com" })).toBeInTheDocument();
    expect(authorizeMobile).not.toHaveBeenCalled();
  });
  it("keeps ineligible accounts on the web and provides the registration link", async () => {
    vi.mocked(inspectMobile).mockResolvedValue({
      transactionId: id,
      clientId: "solaria-mobile",
      expiresAt: "2099-01-01T00:00:00Z",
      email: "user@example.com",
      emailVerified: false,
      eligible: false,
      reasons: ["PROFILE_INCOMPLETE"],
    });
    renderPage();
    expect(await screen.findByRole("link", { name: "Concluir cadastro profissional" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Continuar como user@example.com" })).not.toBeInTheDocument();
    expect(authorizeMobile).not.toHaveBeenCalled();
  });
  it("can cancel without emitting a callback", async () => {
    vi.mocked(cancelMobile).mockResolvedValue(undefined);
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(cancelMobile).toHaveBeenCalledWith(id));
    expect(await screen.findByText("Entrada cancelada. Volte ao aplicativo para iniciar novamente.")).toBeInTheDocument();
    expect(authorizeMobile).not.toHaveBeenCalled();
  });
});

vi.mock("@@/brand/logo/OrganicLogo", () => ({ default: () => <span role="img" aria-label="Solaria" /> }));
