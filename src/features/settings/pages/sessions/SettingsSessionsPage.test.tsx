import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SettingsSessionsPage from "./SettingsSessionsPage";
import { logout } from "@/features/access/access.service";

vi.mock("@/features/access/access.service", () => ({ logout: vi.fn() }));

function renderPage() {
  render(
    <MemoryRouter>
      <SettingsSessionsPage />
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
