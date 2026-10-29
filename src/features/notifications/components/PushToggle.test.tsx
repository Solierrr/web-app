import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PushStatus } from "../notification.enum";
import PushToggle from "./PushToggle";

const mocks = vi.hoisted(() => ({ getPushStatus: vi.fn(), enablePush: vi.fn(), disablePush: vi.fn() }));

vi.mock("../notification.push.service", () => mocks);

describe("PushToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPushStatus.mockResolvedValue(PushStatus.OFF);
  });

  it("renders nothing, and asks for nothing, when push is not configured", async () => {
    mocks.getPushStatus.mockResolvedValue(PushStatus.UNCONFIGURED);
    const { container } = render(<PushToggle />);
    await waitFor(() => expect(mocks.getPushStatus).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
    expect(mocks.enablePush).not.toHaveBeenCalled();
  });

  it("asks for permission only when the user clicks the button", async () => {
    mocks.enablePush.mockImplementation(async () => {
      mocks.getPushStatus.mockResolvedValue(PushStatus.ON);
      return PushStatus.ON;
    });
    render(<PushToggle />);
    const enable = await screen.findByRole("button", { name: "Ativar notificações" });
    expect(screen.getByRole("status")).toHaveTextContent("As notificações estão desativadas neste dispositivo.");
    expect(mocks.enablePush).not.toHaveBeenCalled();

    fireEvent.click(enable);
    expect(await screen.findByRole("button", { name: "Desativar notificações" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("As notificações estão ativadas neste dispositivo.");
    expect(mocks.enablePush).toHaveBeenCalledTimes(1);
  });

  it("turns push off for this device", async () => {
    mocks.getPushStatus.mockResolvedValue(PushStatus.ON);
    mocks.disablePush.mockImplementation(async () => {
      mocks.getPushStatus.mockResolvedValue(PushStatus.OFF);
      return PushStatus.OFF;
    });
    render(<PushToggle />);
    fireEvent.click(await screen.findByRole("button", { name: "Desativar notificações" }));
    expect(await screen.findByRole("button", { name: "Ativar notificações" })).toBeInTheDocument();
    expect(mocks.disablePush).toHaveBeenCalledTimes(1);
  });

  it("explains blocked and unsupported browsers without offering a button", async () => {
    mocks.getPushStatus.mockResolvedValue(PushStatus.BLOCKED);
    const blocked = render(<PushToggle />);
    expect(await screen.findByText(/bloqueadas no navegador/)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    blocked.unmount();

    mocks.getPushStatus.mockResolvedValue(PushStatus.UNSUPPORTED);
    render(<PushToggle />);
    expect(await screen.findByText("Este navegador não oferece notificações push.")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows an alert when the change fails and lets the user try again", async () => {
    mocks.enablePush.mockRejectedValueOnce(new Error("offline"));
    render(<PushToggle />);
    fireEvent.click(await screen.findByRole("button", { name: "Ativar notificações" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível alterar as notificações deste dispositivo. Tente novamente.");
    expect(screen.getByRole("button", { name: "Ativar notificações" })).toBeEnabled();
  });
});
