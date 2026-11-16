import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import RequireAuth from "./RequireAuth";
import { refresh } from "../access.service";
import { clearAuthSession, setAuthSession } from "@/lib/shared/auth/authToken.utils";
import { HttpResponseError } from "@/lib/shared/http/http.service";

vi.mock("../access.service", () => ({ refresh: vi.fn() }));
vi.mock("@@/helpers/accessibility/loading/Loading", () => ({ default: () => <p>Restaurando…</p> }));
vi.mock("@/config/mocks/mockMode.utils", () => ({ isAlwaysMockMode: () => false }));
beforeEach(() => { vi.clearAllMocks(); sessionStorage.clear(); clearAuthSession(); });
afterEach(cleanup);
const session = { accessToken: "access", userId: "id", email: "qa@test.dev", accessTokenExpiresAt: new Date(Date.now() + 900000).toISOString() };
function page() {
  render(<MemoryRouter initialEntries={["/private"]}><Routes><Route element={<RequireAuth />}><Route path="/private" element={<p>Área privada</p>} /></Route><Route path="*" element={<p>Entrar na conta</p>} /></Routes></MemoryRouter>);
}
it("restores a private route after reload", async () => {
  vi.mocked(refresh).mockImplementation(async () => { setAuthSession(session); return session; });
  page(); expect(await screen.findByText("Área privada")).toBeTruthy();
});
it("does not present a network failure as logout and allows retrying", async () => {
  vi.mocked(refresh).mockRejectedValueOnce(new Error("offline")).mockImplementation(async () => { setAuthSession(session); return session; });
  page(); expect(await screen.findByRole("alert")).toBeTruthy();
  expect(screen.queryByText("Entrar na conta")).toBeNull();
  fireEvent.click(screen.getByText("Tentar novamente"));
  expect(await screen.findByText("Área privada")).toBeTruthy();
});
it("redirects an expired cookie to login", async () => {
  vi.mocked(refresh).mockRejectedValue(new Error("expired", { cause: new HttpResponseError(401, "INVALID_REFRESH_TOKEN") }));
  page(); expect(await screen.findByText("Entrar na conta")).toBeTruthy();
});
