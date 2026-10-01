import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SettingsSessionsPage from "./SettingsSessionsPage";
import { logout } from "@/features/access/access.service";

vi.mock("@/features/access/access.service", () => ({ logout: vi.fn() }));

function renderPage() {
  render(
    <MemoryRouter initialEntries={["/pt-BR/configuracoes/sessoes"]}>
      <Routes>
        <Route path="/pt-BR/configuracoes/sessoes" element={<SettingsSessionsPage />} />
        <Route path="/pt-BR/login" element={<p>Tela de login</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SettingsSessionsPage", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_MOCKS", "DEACTIVATED");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("shows only this device and explains the limitation without a server endpoint", async () => {
    renderPage();

    expect(await screen.findByText("Este dispositivo")).toBeInTheDocument();
    expect(screen.getByText(/só é possível ver e encerrar a sessão deste dispositivo/)).toBeInTheDocument();
  });

  it("signs out of this device", async () => {
    vi.mocked(logout).mockResolvedValue(undefined);
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "Sair deste dispositivo" }));

    await waitFor(() => expect(logout).toHaveBeenCalled());
    expect(await screen.findByText("Tela de login")).toBeInTheDocument();
  });

  it("still leaves for the login when the server logout fails", async () => {
    vi.mocked(logout).mockRejectedValue(new Error("offline"));
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "Sair deste dispositivo" }));

    expect(await screen.findByText("Tela de login")).toBeInTheDocument();
  });

  it("reports when another session cannot be ended", async () => {
    renderPage();
    await screen.findByText("Este dispositivo");

    expect(screen.queryByRole("button", { name: "Encerrar sessão" })).not.toBeInTheDocument();
  });

  it("ends another mocked session", async () => {
    vi.stubEnv("VITE_MOCKS", "ALWAYS");
    vi.stubEnv("VITE_MOCKS_DELAY_SECONDS", "0");
    renderPage();

    fireEvent.click((await screen.findAllByRole("button", { name: "Encerrar sessão" }))[0]);

    expect(await screen.findByRole("status")).toHaveTextContent("Sessão encerrada.");
    expect(screen.getAllByRole("button", { name: "Encerrar sessão" })).toHaveLength(1);
  });
});
