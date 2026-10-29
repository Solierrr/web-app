import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Chat from "./Chat";
import * as api from "@/features/messages/messages.messenger.api";
import type { ConversationEvent } from "@/features/messages/messages.messenger.realtime";
import { publishTyping, subscribeToConversation } from "@/features/messages/messages.messenger.socket";

const connection = vi.hoisted(() => ({
  state: { status: "connected", attempts: 0 } as { status: string; attempts: number },
  listeners: new Set<() => void>(),
}));

vi.mock("@/features/messages/messages.messenger.api", () => ({
  getConversation: vi.fn(),
  getConversationMessages: vi.fn(),
  getConversationMessagesSince: vi.fn(),
  getUserSummary: vi.fn(),
  markConversationRead: vi.fn(),
  sendConversationMessage: vi.fn(),
}));
vi.mock("@/features/messages/messages.messenger.socket", () => ({
  subscribeToConversation: vi.fn(),
  publishTyping: vi.fn(),
  subscribeToConnection: (listener: () => void) => {
    connection.listeners.add(listener);
    return () => connection.listeners.delete(listener);
  },
  getConnectionState: () => connection.state,
}));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => ({ userId: "me" }) }));

const conversation: api.ConversationDto = {
  id: "conv-1",
  conversationType: "DIRECT",
  participantIds: ["me", "supplier"],
  title: null,
  lastInteractionAt: null,
  unreadCount: 0,
};
const message = (sequence: number, content: string, extra: Partial<api.MessageDto> = {}): api.MessageDto => ({
  id: `msg-${sequence}`,
  conversationId: "conv-1",
  senderId: "supplier",
  sequence,
  content,
  timestamp: "2026-09-28T12:00:00Z",
  ...extra,
});
const live = (item: api.MessageDto): ConversationEvent => ({ kind: "message", change: "created", message: item });

const listeners = new Set<(event: ConversationEvent) => void>();
function emit(event: ConversationEvent) {
  act(() => listeners.forEach((listener) => listener(event)));
}
function setConnection(status: string, attempts = 0) {
  act(() => {
    connection.state = { status, attempts };
    connection.listeners.forEach((listener) => listener());
  });
}

function renderChat() {
  return render(
    <MemoryRouter initialEntries={["/pt-BR/mensagens/conv-1"]}>
      <Routes>
        <Route path="/:lang/mensagens/:conversationId" element={<Chat />} />
      </Routes>
    </MemoryRouter>,
  );
}

function type(text: string) {
  fireEvent.change(screen.getByRole("textbox"), { target: { value: text } });
}

describe("Chat", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    listeners.clear();
    connection.state = { status: "connected", attempts: 0 };
    connection.listeners.clear();
    vi.mocked(api.getConversation).mockResolvedValue(conversation);
    vi.mocked(api.getConversationMessages).mockResolvedValue([]);
    vi.mocked(api.getConversationMessagesSince).mockResolvedValue([]);
    vi.mocked(api.getUserSummary).mockResolvedValue({ username: "Fornecedor", avatar: null });
    vi.mocked(api.markConversationRead).mockResolvedValue(undefined);
    vi.mocked(subscribeToConversation).mockImplementation((_id, listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    });
  });
  afterEach(() => vi.useRealTimers());

  it("preserves live messages that arrive while history is still loading", async () => {
    let finishHistory!: (messages: api.MessageDto[]) => void;
    vi.mocked(api.getConversationMessages).mockReturnValue(
      new Promise((resolve) => {
        finishHistory = resolve;
      }),
    );
    renderChat();
    emit(live(message(2, "Mensagem ao vivo")));
    await act(async () => {
      finishHistory([message(1, "Mensagem anterior")]);
    });
    expect(await screen.findByText("Mensagem anterior")).toBeInTheDocument();
    expect(screen.getByText("Mensagem ao vivo")).toBeInTheDocument();
    await waitFor(() => expect(api.markConversationRead).toHaveBeenCalledWith("conv-1", 2, "DIRECT"));
  });

  it("does not duplicate a message present in the history and received again live", async () => {
    vi.mocked(api.getConversationMessages).mockResolvedValue([message(1, "Primeira"), message(2, "Segunda")]);
    renderChat();
    await screen.findByText("Segunda");
    emit(live(message(2, "Segunda")));
    emit(live(message(3, "Terceira")));
    expect(screen.getAllByText("Segunda")).toHaveLength(1);
    expect(screen.getByText("Terceira")).toBeInTheDocument();
  });

  it("deduplicates the REST response and live event for a sent message", async () => {
    vi.mocked(api.sendConversationMessage).mockImplementation(async (_id, content, _type, clientMessageId) => {
      const sent = message(1, content, { senderId: "me", clientMessageId });
      emit(live(sent));
      return sent;
    });
    renderChat();
    await screen.findByRole("heading", { name: "Fornecedor" });
    type("Tenho interesse");
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    await waitFor(() => expect(screen.getAllByText("Tenho interesse")).toHaveLength(1));
    expect(api.sendConversationMessage).toHaveBeenCalledWith("conv-1", "Tenho interesse", "DIRECT", expect.any(String));
    expect(screen.queryByText("Enviando...")).not.toBeInTheDocument();
  });

  it("removes the pending bubble when the live event arrives before the REST response", async () => {
    let finishSend!: (sent: api.MessageDto) => void;
    vi.mocked(api.sendConversationMessage).mockReturnValue(
      new Promise((resolve) => {
        finishSend = resolve;
      }),
    );
    renderChat();
    await screen.findByRole("heading", { name: "Fornecedor" });
    type("Olá");
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    expect(await screen.findByText("Enviando...")).toBeInTheDocument();
    const clientMessageId = vi.mocked(api.sendConversationMessage).mock.calls[0][3];
    emit(live(message(1, "Olá", { senderId: "me", clientMessageId })));
    expect(screen.queryByText("Enviando...")).not.toBeInTheDocument();
    expect(screen.getAllByText("Olá")).toHaveLength(1);
    await act(async () => finishSend(message(1, "Olá", { senderId: "me", clientMessageId })));
    expect(screen.getAllByText("Olá")).toHaveLength(1);
  });

  it("keeps the text of a failed message and lets the user resend it", async () => {
    vi.mocked(api.sendConversationMessage).mockRejectedValueOnce(new Error("offline"));
    renderChat();
    await screen.findByRole("heading", { name: "Fornecedor" });
    type("Quero um orçamento");
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    expect(await screen.findByText("Não foi possível enviar esta mensagem.")).toBeInTheDocument();
    expect(screen.getByText("Quero um orçamento")).toBeInTheDocument();

    vi.mocked(api.sendConversationMessage).mockImplementation(async (_id, content, _type, clientMessageId) =>
      message(1, content, { senderId: "me", clientMessageId }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Reenviar" }));
    await waitFor(() => expect(screen.queryByText("Não foi possível enviar esta mensagem.")).not.toBeInTheDocument());
    expect(screen.getAllByText("Quero um orçamento")).toHaveLength(1);
    const ids = vi.mocked(api.sendConversationMessage).mock.calls.map((call) => call[3]);
    expect(ids[0]).toBe(ids[1]);
  });

  it("gives the discarded text back to the composer", async () => {
    vi.mocked(api.sendConversationMessage).mockRejectedValue(new Error("offline"));
    renderChat();
    await screen.findByRole("heading", { name: "Fornecedor" });
    type("Texto importante");
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    fireEvent.click(await screen.findByRole("button", { name: "Descartar" }));
    expect(screen.getByRole("textbox")).toHaveValue("Texto importante");
  });

  it("resends failed messages when the browser comes back online", async () => {
    vi.mocked(api.sendConversationMessage).mockRejectedValueOnce(new Error("offline"));
    renderChat();
    await screen.findByRole("heading", { name: "Fornecedor" });
    type("Ainda aí?");
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    await screen.findByText("Não foi possível enviar esta mensagem.");
    vi.mocked(api.sendConversationMessage).mockImplementation(async (_id, content, _type, clientMessageId) =>
      message(1, content, { senderId: "me", clientMessageId }),
    );
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    await waitFor(() => expect(screen.queryByText("Não foi possível enviar esta mensagem.")).not.toBeInTheDocument());
    expect(api.sendConversationMessage).toHaveBeenCalledTimes(2);
  });

  it("shows who is typing and the presence of the other person", async () => {
    renderChat();
    await screen.findByRole("heading", { name: "Fornecedor" });
    emit({ kind: "presenceSnapshot", users: { me: true, supplier: true }, epoch: "e", version: 1 });
    expect(screen.getByText("Online")).toBeInTheDocument();
    emit({ kind: "typing", userId: "supplier", typing: true });
    expect(screen.getByText("Digitando...")).toBeInTheDocument();
    emit({ kind: "typing", userId: "supplier", typing: false });
    expect(screen.queryByText("Digitando...")).not.toBeInTheDocument();
    emit({ kind: "presence", userId: "supplier", online: false, epoch: "e", version: 2 });
    expect(screen.getByText("Offline")).toBeInTheDocument();
  });

  it("clears the typing indicator when the person sends the message", async () => {
    renderChat();
    await screen.findByRole("heading", { name: "Fornecedor" });
    emit({ kind: "typing", userId: "supplier", typing: true });
    expect(screen.getByText("Digitando...")).toBeInTheDocument();
    emit(live(message(1, "Pronto")));
    expect(screen.queryByText("Digitando...")).not.toBeInTheDocument();
  });

  it("publishes that the user is typing and stops when the message is sent", async () => {
    vi.mocked(api.sendConversationMessage).mockImplementation(async (_id, content) => message(1, content, { senderId: "me" }));
    renderChat();
    await screen.findByRole("heading", { name: "Fornecedor" });
    type("Ol");
    expect(publishTyping).toHaveBeenCalledWith("conv-1", true);
    type("Olá");
    expect(publishTyping).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    expect(publishTyping).toHaveBeenLastCalledWith("conv-1", false);
  });

  it("synchronizes from the last known sequence when a live message skips a sequence", async () => {
    vi.mocked(api.getConversationMessages).mockResolvedValue([message(1, "Um")]);
    renderChat();
    await screen.findByText("Um");
    vi.mocked(api.getConversationMessagesSince).mockClear();
    vi.mocked(api.getConversationMessagesSince).mockResolvedValue([message(2, "Dois"), message(3, "Três"), message(4, "Quatro")]);
    emit(live(message(4, "Quatro")));
    expect(await screen.findByText("Dois")).toBeInTheDocument();
    expect(screen.getByText("Três")).toBeInTheDocument();
    expect(screen.getAllByText("Quatro")).toHaveLength(1);
    expect(api.getConversationMessagesSince).toHaveBeenCalled();
  });

  it("catches up with the history again when the connection comes back", async () => {
    connection.state = { status: "reconnecting", attempts: 1 };
    vi.mocked(api.getConversationMessages).mockResolvedValue([message(1, "Um")]);
    renderChat();
    await screen.findByText("Um");
    expect(screen.getByText("Reconectando ao chat em tempo real...")).toBeInTheDocument();
    vi.mocked(api.getConversationMessagesSince).mockResolvedValue([message(2, "Perdida durante a queda")]);
    setConnection("connected");
    expect(await screen.findByText("Perdida durante a queda")).toBeInTheDocument();
    expect(screen.queryByText("Reconectando ao chat em tempo real...")).not.toBeInTheDocument();
  });

  it("explains the cold start of the messaging service after repeated attempts", async () => {
    connection.state = { status: "reconnecting", attempts: 3 };
    renderChat();
    expect(await screen.findByText(/pode estar iniciando/)).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("shows removed messages as a placeholder", async () => {
    vi.mocked(api.getConversationMessages).mockResolvedValue([message(1, "Segredo")]);
    renderChat();
    await screen.findByText("Segredo");
    emit({ kind: "message", change: "deleted", message: message(1, "", { deleted: true }) });
    expect(screen.getByText("Mensagem apagada")).toBeInTheDocument();
    expect(screen.queryByText("Segredo")).not.toBeInTheDocument();
  });

  it("does not enable sending when the conversation cannot be loaded", async () => {
    vi.mocked(api.getConversation).mockRejectedValue(new Error("forbidden"));
    renderChat();
    await screen.findByRole("alert");
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Mensagem" } });
    expect(screen.getByRole("button", { name: "Enviar mensagem" })).toBeDisabled();
  });
});

describe("Chat with the assistant", () => {
  const assistant: api.ConversationDto = { ...conversation, conversationType: "CHAT_BOT", participantIds: ["me"] };
  const ask = (sequence: number, content: string) => message(sequence, content, { senderId: "me", messageType: "USER_TO_CHATBOT" });
  const answer = (sequence: number, content: string) =>
    message(sequence, content, { senderId: "assistant", messageType: "CHATBOT_TO_USER", role: "assistant" });

  beforeEach(() => {
    vi.resetAllMocks();
    listeners.clear();
    connection.state = { status: "connected", attempts: 0 };
    connection.listeners.clear();
    vi.mocked(api.getConversation).mockResolvedValue(assistant);
    vi.mocked(api.getConversationMessages).mockResolvedValue([ask(1, "Como funciona?")]);
    vi.mocked(api.getConversationMessagesSince).mockResolvedValue([]);
    vi.mocked(api.markConversationRead).mockResolvedValue(undefined);
    vi.mocked(subscribeToConversation).mockImplementation((_id, listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    });
  });
  afterEach(() => vi.useRealTimers());

  it("shows the thinking state until the reply arrives live", async () => {
    renderChat();
    expect(await screen.findByText("O assistente está pensando...")).toBeInTheDocument();
    emit(live(answer(2, "É simples.")));
    expect(await screen.findByText("É simples.")).toBeInTheDocument();
    expect(screen.queryByText("O assistente está pensando...")).not.toBeInTheDocument();
  });

  it("offers a retry when the assistant does not answer in time", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(api.sendConversationMessage).mockImplementation(async (_id, content) => ask(2, content));
    renderChat();
    await screen.findByText("O assistente está pensando...");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(45_000);
    });
    expect(await screen.findByText(/demorando mais que o normal/)).toBeInTheDocument();
    expect(api.getConversationMessagesSince).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    await waitFor(() => expect(api.sendConversationMessage).toHaveBeenCalledWith("conv-1", "Como funciona?", "CHAT_BOT", expect.any(String)));
  });

  it("does not publish typing or save a read cursor for assistant conversations", async () => {
    renderChat();
    await screen.findByText("Como funciona?");
    type("abc");
    expect(publishTyping).not.toHaveBeenCalled();
    await waitFor(() => expect(api.markConversationRead).toHaveBeenCalledWith("conv-1", 1, "CHAT_BOT"));
  });
});
