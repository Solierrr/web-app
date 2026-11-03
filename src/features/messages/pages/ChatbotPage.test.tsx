import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ChatbotPage from "./ChatbotPage";
import * as api from "@/features/messages/messages.messenger.api";
import { sendAssistantTurn } from "@/features/assistant/assistant.service";
import { AgentChatError } from "@/features/error/agent-chat/AgentChat.error";
import { getAssistantThread } from "@/features/messages/messages.assistant.utils";

const auth = vi.hoisted(() => ({ session: { userId: "me" } as { userId: string } | null }));

const connected = vi.hoisted(() => ({ status: "connected", attempts: 0 }));

vi.mock("@/features/messages/messages.messenger.api", () => ({
  createChatbotConversation: vi.fn(),
  getConversation: vi.fn(),
  getConversationMessages: vi.fn(),
  getConversationMessagesSince: vi.fn(),
  getUserSummary: vi.fn(),
  markConversationRead: vi.fn(),
  sendConversationMessage: vi.fn(),
}));
vi.mock("@/features/assistant/assistant.service", () => ({ sendAssistantTurn: vi.fn() }));
vi.mock("@/features/messages/messages.messenger.socket", () => ({
  subscribeToConversation: () => () => undefined,
  publishTyping: vi.fn(),
  subscribeToConnection: () => () => undefined,
  getConnectionState: () => connected,
}));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => auth.session }));
vi.mock("@@/ui/morphing-hexagon/MorphingHexagon", () => ({ default: () => null }));
vi.mock("@@/brand/logo/OrganicLogo", () => ({ default: () => null }));
vi.mock("@@/layout/access/canvas/SideCanvas", () => ({ default: () => null }));

const assistant: api.ConversationDto = {
  id: "bot-1",
  conversationType: "CHAT_BOT",
  participantIds: ["me"],
  title: null,
  lastInteractionAt: null,
  unreadCount: 0,
};
const ask = (sequence: number, content: string): api.MessageDto => ({
  id: `ask-${sequence}`,
  conversationId: "bot-1",
  senderId: "me",
  sequence,
  content,
  timestamp: "2026-10-28T12:00:00Z",
  messageType: "USER_TO_CHATBOT",
});
const answer = (sequence: number, content: string): api.MessageDto => ({
  id: `answer-${sequence}`,
  conversationId: "bot-1",
  senderId: "assistant",
  sequence,
  content,
  timestamp: "2026-10-28T12:00:05Z",
  messageType: "CHATBOT_TO_USER",
  role: "assistant",
});

function renderPage(embedded = true) {
  return render(
    <MemoryRouter initialEntries={["/pt-BR/chatbot"]}>
      <Routes>
        <Route path="/:lang/chatbot" element={<ChatbotPage embedded={embedded} />} />
      </Routes>
    </MemoryRouter>,
  );
}

function send(text: string) {
  fireEvent.change(screen.getByRole("textbox"), { target: { value: text } });
  fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem ao assistente" }));
}

describe("ChatbotPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    auth.session = { userId: "me" };
    vi.mocked(api.getConversation).mockResolvedValue(assistant);
    vi.mocked(api.getConversationMessages).mockResolvedValue([ask(1, "Como comparar placas?"), answer(2, "Compare potência e eficiência.")]);
    vi.mocked(api.getConversationMessagesSince).mockResolvedValue([]);
    vi.mocked(api.markConversationRead).mockResolvedValue(undefined);
    vi.mocked(sendAssistantTurn).mockResolvedValue({ response: "Compare potência e eficiência.", messengerConversationId: "bot-1" });
  });

  it("sends the first message to the agent, which opens the conversation, and shows the saved exchange", async () => {
    renderPage();
    send("Como comparar placas?");

    expect(await screen.findByText("Compare potência e eficiência.")).toBeInTheDocument();
    expect(screen.getByText("Como comparar placas?")).toBeInTheDocument();
    expect(sendAssistantTurn).toHaveBeenCalledWith(expect.any(String), "Como comparar placas?");
    expect(api.createChatbotConversation).not.toHaveBeenCalled();
    expect(api.sendConversationMessage).not.toHaveBeenCalled();
    const threadId = vi.mocked(sendAssistantTurn).mock.calls[0][0];
    expect(getAssistantThread("bot-1")).toBe(threadId);
  });

  it("shows the thinking state while the agent is answering", async () => {
    let finish!: (turn: { response: string; messengerConversationId: string }) => void;
    vi.mocked(sendAssistantTurn).mockReturnValue(new Promise((resolve) => (finish = resolve)));
    renderPage();
    send("Como comparar placas?");

    expect(await screen.findByText("O assistente está pensando...")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeDisabled();
    finish({ response: "ok", messengerConversationId: "bot-1" });
    expect(await screen.findByText("Compare potência e eficiência.")).toBeInTheDocument();
  });

  it("keeps the typed text and explains the failure when the agent cannot answer", async () => {
    vi.mocked(sendAssistantTurn).mockRejectedValue(
      new AgentChatError("unavailable", "O assistente está indisponível ou iniciando, o que pode levar até 1 minuto. Tente novamente."),
    );
    renderPage();
    send("Preciso de ajuda");

    expect(await screen.findByText(/indisponível ou iniciando/)).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("Preciso de ajuda");
    expect(api.sendConversationMessage).not.toHaveBeenCalled();
  });

  it("falls back to the generic message for an unexpected failure", async () => {
    vi.mocked(sendAssistantTurn).mockRejectedValue(new Error("boom"));
    renderPage();
    send("Olá");

    expect(await screen.findByText("Não foi possível iniciar a conversa. Tente novamente.")).toBeInTheDocument();
  });

  it("continues the same thread on the next message", async () => {
    renderPage();
    send("Como comparar placas?");
    await screen.findByText("Compare potência e eficiência.");
    vi.mocked(sendAssistantTurn).mockClear();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "E a garantia?" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));

    await waitFor(() => expect(sendAssistantTurn).toHaveBeenCalledOnce());
    expect(sendAssistantTurn).toHaveBeenCalledWith(getAssistantThread("bot-1"), "E a garantia?");
  });

  it("asks visitors without a session to sign in instead of pretending to answer", async () => {
    auth.session = null;
    renderPage(false);
    send("Olá");
    expect(await screen.findByText(/Entre na sua conta/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", expect.stringContaining("/pt-BR/"));
    expect(sendAssistantTurn).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox")).toHaveValue("Olá");
  });
});
