vi.mock("@@/layout/access/canvas/SideCanvas", () => ({ default: () => null }));
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SettingsPage from "./SettingsPage";

const getPushStatus = vi.hoisted(() => vi.fn());
vi.mock("@/features/notifications/notification.push.service", () => ({ getPushStatus, enablePush: vi.fn(), disablePush: vi.fn() }));

describe("SettingsPage", () => {
  beforeEach(() => getPushStatus.mockResolvedValue("UNCONFIGURED"));

  it("links to the profile, security, privacy and sessions pages", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Perfil" })).toHaveAttribute("href", "/pt-BR/usuario");
    expect(screen.getByRole("link", { name: "Segurança" })).toHaveAttribute("href", "/pt-BR/configuracoes/seguranca");
    expect(screen.getByRole("link", { name: "Privacidade" })).toHaveAttribute("href", "/pt-BR/configuracoes/privacidade");
    expect(screen.getByRole("link", { name: "Sessões e dispositivos" })).toHaveAttribute("href", "/pt-BR/configuracoes/sessoes");
  });

  it("offers the push switch for this device only when push is available", async () => {
    getPushStatus.mockResolvedValue("OFF");
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Notificações neste dispositivo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ativar notificações" })).toBeInTheDocument();
  });

  it("hides the push switch when push is not configured", async () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    await vi.waitFor(() => expect(getPushStatus).toHaveBeenCalled());
    await act(async () => undefined);
    expect(screen.queryByRole("heading", { name: "Notificações neste dispositivo" })).not.toBeInTheDocument();
  });
});
