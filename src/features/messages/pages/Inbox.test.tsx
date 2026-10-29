import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Inbox from "./Inbox";
import * as api from "@/features/messages/messages.messenger.api";
import type { UserEvent } from "@/features/messages/messages.messenger.realtime";
import { subscribeToUserEvents } from "@/features/messages/messages.messenger.socket";
import { startAssistantConversation } from "@/features/messages/messages.assistant.service";
import { AgentChatError } from "@/features/error/agent-chat/AgentChat.error";

const connection = vi.hoisted(() => ({
  state: { status: "connected", attempts: 0 } as { status: string; attempts: number },
  listeners: new Set<() => void>(),
}));

vi.mock("@/features/messages/messages.messenger.api", () => ({
  getConversations: vi.fn(),
  getUserSummary: vi.fn(),
  createDirectConversation: vi.fn(),
  getMessengerContacts: vi.fn(),
}));
vi.mock("@/features/messages/messages.messenger.socket", () => ({
  subscribeToUserEvents: vi.fn(),
  subscribeToConnection: (listener: () => void) => {
    connection.listeners.add(listener);
    return () => connection.listeners.delete(listener);
  },
  getConnectionState: () => connection.state,
}));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => ({ userId: "me" }) }));
vi.mock("@@/layout/access/canvas/SideCanvas", () => ({ default: () => null }));
const activeContext = vi.hoisted(() => ({ value: { kind: "personal", company: null } as { kind: string; company: { id: string } | null } }));
vi.mock("@/lib/shared/context/ActiveContext", () => ({ useActiveContext: () => activeContext.value }));
vi.mock("@/features/messages/messages.assistant.service", () => ({ startAssistantConversation: vi.fn() }));

const conversation = (id: string, extra: Partial<api.ConversationDto> = {}): api.ConversationDto => ({
  id,
  conversationType: "DIRECT",
  participantIds: ["me", `person-${id}`],
  title: null,
  lastInteractionAt: "2026-10-28T10:00:00Z",
  unreadCount: 0,
  ...extra,
});

const listeners = new Set<(event: UserEvent) => void>();
function emit(event: UserEvent) {
  act(() => listeners.forEach((listener) => listener(event)));
}
function setConnection(status: string, attempts = 0) {
  act(() => {
    connection.state = { status, attempts };
    connection.listeners.forEach((listener) => listener());
  });
}

function OperationalDestination() {
  const { state } = useLocation();
  return <p>assistente operacional: {(state as { initialMessage?: string } | null)?.initialMessage ?? "sem mensagem"}</p>;
}

function renderInbox() {
  return render(
    <MemoryRouter initialEntries={["/pt-BR/mensagens"]}>
      <Routes>
        <Route path="/:lang/mensagens" element={<Inbox />} />
        <Route path="/:lang/painel/assistente" element={<OperationalDestination />} />
        <Route path="/:lang/mensagens/:conversationId" element={<p>conversa aberta</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Inbox", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    activeContext.value = { kind: "personal", company: null };
    listeners.clear();
    connection.state = { status: "connected", attempts: 0 };
    connection.listeners.clear();
    vi.mocked(api.getConversations).mockResolvedValue([
      conversation("a", { unreadCount: 1, lastInteractionAt: "2026-10-28T10:00:00Z" }),
      conversation("b", { lastInteractionAt: "2026-10-28T09:00:00Z" }),
    ]);
    vi.mocked(api.getUserSummary).mockImplementation(async (id) => ({ username: id === "person-a" ? "Ana" : "Bruno", avatar: null }));
    vi.mocked(subscribeToUserEvents).mockImplementation((listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    });
  });
  afterEach(() => vi.useRealTimers());

  it("updates the unread badge and the order of the list as events arrive", async () => {
    renderInbox();
    const list = await screen.findByRole("list");
    await within(list).findByText("Ana");
    expect(screen.getByLabelText("1 mensagem não lida")).toBeInTheDocument();
    emit({ kind: "conversationUpdated", conversation: conversation("b", { unreadCount: 3, lastInteractionAt: "2026-10-28T11:00:00Z" }) });
    expect(screen.getByLabelText("3 mensagens não lidas")).toBeInTheDocument();
    const names = within(screen.getByRole("list")).getAllByRole("link");
    expect(names[0]).toHaveTextContent("Bruno");
    emit({ kind: "conversationUpdated", conversation: conversation("b", { unreadCount: 0, lastInteractionAt: "2026-10-28T11:00:00Z" }) });
    expect(screen.queryByLabelText("3 mensagens não lidas")).not.toBeInTheDocument();
    expect(api.getConversations).toHaveBeenCalledTimes(1);
  });

  it("ignores an update older than the version already applied", async () => {
    vi.mocked(api.getConversations).mockResolvedValue([conversation("a", { unreadCount: 4, syncEpoch: "e", syncVersion: 10 })]);
    renderInbox();
    await screen.findByText("Ana");
    emit({ kind: "conversationUpdated", conversation: conversation("a", { unreadCount: 1, syncEpoch: "e", syncVersion: 9 }) });
    expect(screen.getByLabelText("4 mensagens não lidas")).toBeInTheDocument();
  });

  it("reloads the list when an unknown conversation shows up", async () => {
    renderInbox();
    await screen.findByText("Ana");
    vi.mocked(api.getConversations).mockResolvedValue([conversation("a"), conversation("b"), conversation("c", { unreadCount: 2 })]);
    emit({ kind: "conversationUpdated", conversation: conversation("c", { unreadCount: 2 }) });
    await waitFor(() => expect(api.getConversations).toHaveBeenCalledTimes(2));
    expect(await screen.findByLabelText("2 mensagens não lidas")).toBeInTheDocument();
  });

  it("drops a removed conversation", async () => {
    renderInbox();
    await screen.findByText("Ana");
    emit({ kind: "conversationRemoved", id: "a" });
    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
    expect(screen.getByText("Bruno")).toBeInTheDocument();
  });

  it("reconciles with the server when the connection comes back", async () => {
    connection.state = { status: "reconnecting", attempts: 1 };
    renderInbox();
    await screen.findByText("Ana");
    expect(screen.getByText("Reconectando ao chat em tempo real...")).toBeInTheDocument();
    vi.mocked(api.getConversations).mockResolvedValue([conversation("a", { unreadCount: 7 }), conversation("b")]);
    setConnection("connected");
    expect(await screen.findByLabelText("7 mensagens não lidas")).toBeInTheDocument();
    expect(screen.queryByText("Reconectando ao chat em tempo real...")).not.toBeInTheDocument();
  });

  describe("starting the assistant from an empty inbox", () => {
    beforeEach(() => {
      vi.mocked(api.getConversations).mockResolvedValue([]);
    });

    function sendFirstMessage(text: string) {
      fireEvent.change(screen.getByRole("textbox"), { target: { value: text } });
      fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem ao assistente" }));
    }

    it("opens the conversation that the agent created for a personal context", async () => {
      vi.mocked(startAssistantConversation).mockResolvedValue(conversation("bot", { conversationType: "CHAT_BOT", participantIds: ["me"] }));
      renderInbox();
      await screen.findByRole("textbox");
      sendFirstMessage("Quero uma placa");

      await waitFor(() => expect(startAssistantConversation).toHaveBeenCalledWith("Quero uma placa"));
      expect(await screen.findByText("conversa aberta")).toBeInTheDocument();
    });

    it("explains why the agent failed and keeps the text", async () => {
      vi.mocked(startAssistantConversation).mockRejectedValue(
        new AgentChatError("rateLimited", "Muitas mensagens em pouco tempo. Aguarde um instante e tente novamente."),
      );
      renderInbox();
      await screen.findByRole("textbox");
      sendFirstMessage("Quero uma placa");

      expect(await screen.findByText("Muitas mensagens em pouco tempo. Aguarde um instante e tente novamente.")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toHaveValue("Quero uma placa");
    });

    it("hands the question of a company to the operational assistant instead of the demandant agent", async () => {
      activeContext.value = { kind: "company", company: { id: "company-1" } };
      renderInbox();
      await screen.findByRole("textbox");
      sendFirstMessage("Onde ficam as ofertas?");

      expect(await screen.findByText("assistente operacional: Onde ficam as ofertas?")).toBeInTheDocument();
      expect(startAssistantConversation).not.toHaveBeenCalled();
    });
  });

  it("polls only while the live connection is down", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderInbox();
    await screen.findByText("Ana");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(41_000);
    });
    expect(api.getConversations).toHaveBeenCalledTimes(1);
    setConnection("unavailable");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(21_000);
    });
    expect(vi.mocked(api.getConversations).mock.calls.length).toBeGreaterThan(1);
  });
});
