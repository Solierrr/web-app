import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NotificationItem, NotificationPage } from "../notification";
import { PushStatus } from "../notification.enum";
import NotificationCenter from "./NotificationCenter";

const mocks = vi.hoisted(() => ({
  getUnreadCount: vi.fn(),
  listNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  syncPushRegistration: vi.fn(),
  subscribeToForegroundPush: vi.fn(),
  getPushStatus: vi.fn(),
  enablePush: vi.fn(),
  disablePush: vi.fn(),
  connection: { status: "idle", attempts: 0 },
}));

vi.mock("../notification.service", () => ({
  getUnreadCount: mocks.getUnreadCount,
  listNotifications: mocks.listNotifications,
  markNotificationRead: mocks.markNotificationRead,
  markAllNotificationsRead: mocks.markAllNotificationsRead,
}));
vi.mock("../notification.push.service", () => ({
  syncPushRegistration: mocks.syncPushRegistration,
  subscribeToForegroundPush: mocks.subscribeToForegroundPush,
  getPushStatus: mocks.getPushStatus,
  enablePush: mocks.enablePush,
  disablePush: mocks.disablePush,
}));
vi.mock("@/features/messages/messages.hooks", () => ({ useMessengerConnection: () => mocks.connection }));

function item(id: number, overrides: Partial<NotificationItem> = {}): NotificationItem {
  return {
    id: `n-${id}`,
    type: "NEW_MESSAGE",
    title: `Título ${id}`,
    body: `Corpo ${id}`,
    data: { conversationId: `c-${id}` },
    createdAt: "2026-10-29T10:00:00Z",
    readAt: null,
    ...overrides,
  };
}

function page(content: NotificationItem[], number = 0, totalPages = 1): NotificationPage {
  return { content, page: number, size: 20, totalElements: content.length, totalPages };
}

function Where() {
  const { pathname } = useLocation();
  return <output data-testid="where">{pathname}</output>;
}

function renderCenter() {
  return render(
    <MemoryRouter initialEntries={["/pt-BR/painel"]}>
      <Routes>
        <Route
          path="/:lang/*"
          element={
            <>
              <NotificationCenter />
              <Where />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

const bell = () => screen.getByRole("button", { name: /^Notificações/ });

describe("NotificationCenter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.connection.status = "idle";
    mocks.getUnreadCount.mockResolvedValue(0);
    mocks.listNotifications.mockResolvedValue(page([]));
    mocks.markNotificationRead.mockImplementation(async (id: string) => item(Number(id.slice(2)), { readAt: "2026-10-29T11:00:00Z" }));
    mocks.markAllNotificationsRead.mockResolvedValue(undefined);
    mocks.syncPushRegistration.mockResolvedValue(undefined);
    mocks.subscribeToForegroundPush.mockResolvedValue(() => undefined);
    mocks.getPushStatus.mockResolvedValue(PushStatus.ON);
    mocks.enablePush.mockResolvedValue(PushStatus.ON);
  });

  it("shows the unread count on the bell, labels it for screen readers and caps it", async () => {
    mocks.getUnreadCount.mockResolvedValue(3);
    renderCenter();
    expect(await screen.findByRole("button", { name: "Notificações, 3 não lidas" })).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("caps the badge at 99+ and hides it when there is nothing unread", async () => {
    mocks.getUnreadCount.mockResolvedValueOnce(120);
    renderCenter();
    expect(await screen.findByText("99+")).toBeInTheDocument();
    mocks.getUnreadCount.mockResolvedValueOnce(0);
    act(() => {
      window.dispatchEvent(new Event("solaria:notifications"));
    });
    await waitFor(() => expect(screen.queryByText("99+")).not.toBeInTheDocument());
    expect(bell()).toHaveAccessibleName("Notificações");
  });

  it("registers the device and listens for foreground messages when it mounts", async () => {
    renderCenter();
    await waitFor(() => expect(mocks.syncPushRegistration).toHaveBeenCalledTimes(1));
    expect(mocks.subscribeToForegroundPush).toHaveBeenCalledTimes(1);
  });

  it("refreshes the count when a push arrives in the foreground and announces it politely", async () => {
    mocks.getUnreadCount.mockResolvedValueOnce(1).mockResolvedValueOnce(2);
    renderCenter();
    await screen.findByText("1");
    const handler = mocks.subscribeToForegroundPush.mock.calls[0][0] as (data: Record<string, string>) => void;
    const toast = vi.fn();
    window.addEventListener("solaria:toast", toast);
    act(() => handler({ notificationId: "n-9", type: "NEW_MESSAGE", title: "Nova mensagem", body: "Olá" }));
    expect(await screen.findByText("2")).toBeInTheDocument();
    expect(toast).toHaveBeenCalledTimes(1);
    expect((toast.mock.calls[0][0] as CustomEvent).detail.message).toBe("Nova mensagem: Olá");
    expect(screen.getByText("Nova notificação. Você tem 2 não lidas.")).toBeInTheDocument();
    window.removeEventListener("solaria:toast", toast);
  });

  it("refreshes the count when the browser comes back online or the messenger reconnects", async () => {
    mocks.getUnreadCount.mockResolvedValue(1);
    const view = renderCenter();
    await screen.findByText("1");
    mocks.getUnreadCount.mockResolvedValue(4);
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(await screen.findByText("4")).toBeInTheDocument();
    mocks.connection.status = "connected";
    mocks.getUnreadCount.mockResolvedValue(5);
    view.rerender(
      <MemoryRouter initialEntries={["/pt-BR/painel"]}>
        <Routes>
          <Route path="/:lang/*" element={<NotificationCenter />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText("5")).toBeInTheDocument();
  });

  it("opens a labelled dialog with a loading state, then the notifications", async () => {
    let resolve: (value: NotificationPage) => void = () => undefined;
    mocks.listNotifications.mockReturnValueOnce(new Promise<NotificationPage>((done) => (resolve = done)));
    renderCenter();
    fireEvent.click(bell());
    const dialog = await screen.findByRole("dialog", { name: "Notificações" });
    expect(bell()).toHaveAttribute("aria-expanded", "true");
    expect(within(dialog).getByText("Carregando notificações...")).toBeInTheDocument();
    await act(async () => resolve(page([item(1), item(2, { readAt: "2026-10-29T10:30:00Z" })])));
    const list = await within(dialog).findByRole("list", { name: "Lista de notificações" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(within(list).getByText("Título 1")).toBeInTheDocument();
    expect(within(list).getAllByRole("button", { name: /^Marcar como lida:/ })).toHaveLength(1);
  });

  it("shows an empty state and an error state with retry", async () => {
    renderCenter();
    bell().focus();
    fireEvent.click(bell());
    expect(await screen.findByText("Você não tem notificações.")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(bell()).toHaveFocus();

    mocks.listNotifications.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(page([item(1)]));
    fireEvent.click(bell());
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar as notificações.");
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByText("Título 1")).toBeInTheDocument();
  });

  it("marks one notification as read from its button and keeps the others unread", async () => {
    mocks.listNotifications.mockResolvedValue(page([item(1), item(2)]));
    renderCenter();
    fireEvent.click(bell());
    fireEvent.click(await screen.findByRole("button", { name: "Marcar como lida: Título 1" }));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Marcar como lida: Título 1" })).not.toBeInTheDocument());
    expect(mocks.markNotificationRead).toHaveBeenCalledWith("n-1");
    expect(screen.getByRole("button", { name: "Marcar como lida: Título 2" })).toBeInTheDocument();
  });

  it("marks everything as read, announces it and disables the action when nothing is unread", async () => {
    mocks.listNotifications.mockResolvedValue(page([item(1), item(2)]));
    renderCenter();
    fireEvent.click(bell());
    await screen.findByText("Título 1");
    fireEvent.click(screen.getByRole("button", { name: "Marcar todas como lidas" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Marcar todas como lidas" })).toBeDisabled());
    expect(mocks.markAllNotificationsRead).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole("status").some((node) => node.textContent === "Todas as notificações foram marcadas como lidas.")).toBe(true);
  });

  it("reports a failed action without losing the list", async () => {
    mocks.listNotifications.mockResolvedValue(page([item(1)]));
    mocks.markAllNotificationsRead.mockRejectedValueOnce(new Error("offline"));
    renderCenter();
    fireEvent.click(bell());
    await screen.findByText("Título 1");
    fireEvent.click(screen.getByRole("button", { name: "Marcar todas como lidas" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível atualizar a notificação. Tente novamente.");
    expect(screen.getByText("Título 1")).toBeInTheDocument();
  });

  it("opens the conversation of a new message, marks it as read and closes the popover", async () => {
    mocks.listNotifications.mockResolvedValue(page([item(7)]));
    renderCenter();
    fireEvent.click(bell());
    fireEvent.click(await screen.findByRole("button", { name: /^Não lida: Título 7/ }));
    await waitFor(() => expect(screen.getByTestId("where")).toHaveTextContent("/pt-BR/mensagens/c-7"));
    expect(mocks.markNotificationRead).toHaveBeenCalledWith("n-7");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("never navigates to a destination it does not know", async () => {
    mocks.listNotifications.mockResolvedValue(
      page([item(1, { type: "SERVICE_SCHEDULED", data: { url: "https://evil.test" } }), item(2, { data: { conversationId: "../admin" } })]),
    );
    renderCenter();
    fireEvent.click(bell());
    fireEvent.click(await screen.findByRole("button", { name: /^Não lida: Título 1/ }));
    await waitFor(() => expect(mocks.markNotificationRead).toHaveBeenCalledWith("n-1"));
    expect(screen.getByTestId("where")).toHaveTextContent("/pt-BR/painel");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Não lida: Título 2/ }));
    await waitFor(() => expect(screen.getByTestId("where")).toHaveTextContent("/pt-BR/mensagens"));
    expect(screen.getByTestId("where")).not.toHaveTextContent("admin");
  });

  it("loads further pages on demand without repeating items", async () => {
    mocks.listNotifications.mockResolvedValueOnce(page([item(1), item(2)], 0, 2)).mockResolvedValueOnce(page([item(2), item(3)], 1, 2));
    renderCenter();
    fireEvent.click(bell());
    fireEvent.click(await screen.findByRole("button", { name: "Carregar mais" }));
    await screen.findByText("Título 3");
    expect(mocks.listNotifications).toHaveBeenLastCalledWith({ page: 1, size: 20 });
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.queryByRole("button", { name: "Carregar mais" })).not.toBeInTheDocument();
  });

  it("reloads the open list when a push arrives", async () => {
    mocks.listNotifications.mockResolvedValueOnce(page([item(1)])).mockResolvedValueOnce(page([item(2), item(1)]));
    renderCenter();
    fireEvent.click(bell());
    await screen.findByText("Título 1");
    const handler = mocks.subscribeToForegroundPush.mock.calls[0][0] as (data: Record<string, string>) => void;
    act(() => handler({ title: "Nova" }));
    expect(await screen.findByText("Título 2")).toBeInTheDocument();
  });

  it("offers to turn push on from inside the center only while it is off", async () => {
    mocks.getPushStatus.mockResolvedValue(PushStatus.OFF);
    mocks.enablePush.mockImplementation(async () => {
      mocks.getPushStatus.mockResolvedValue(PushStatus.ON);
      return PushStatus.ON;
    });
    renderCenter();
    fireEvent.click(bell());
    const enable = await screen.findByRole("button", { name: "Ativar notificações" });
    expect(mocks.enablePush).not.toHaveBeenCalled();
    fireEvent.click(enable);
    await waitFor(() => expect(mocks.enablePush).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Ativar notificações" })).not.toBeInTheDocument());
  });

  it("does not offer push when it is on, blocked, unsupported or unconfigured", async () => {
    for (const status of [PushStatus.ON, PushStatus.BLOCKED, PushStatus.UNSUPPORTED, PushStatus.UNCONFIGURED]) {
      mocks.getPushStatus.mockResolvedValue(status);
      const view = renderCenter();
      fireEvent.click(bell());
      await screen.findByText("Você não tem notificações.");
      expect(screen.queryByRole("button", { name: "Ativar notificações" })).not.toBeInTheDocument();
      view.unmount();
    }
  });
});
