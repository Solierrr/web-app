import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ChatbotPage from "./ChatbotPage";
import * as api from "@/features/messages/messages.messenger.api";
import type { ConversationEvent } from "@/features/messages/messages.messenger.realtime";
import { subscribeToConversation } from "@/features/messages/messages.messenger.socket";

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
vi.mock("@/features/messages/messages.messenger.socket", () => ({
  subscribeToConversation: vi.fn(),
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
const listeners = new Set<(event: ConversationEvent) => void>();

function renderPage(embedded = true) {
  return render(
    <MemoryRouter initialEntries={["/pt-BR/chatbot"]}>
      <Routes>
        <Route path="/:lang/chatbot" element={<ChatbotPage embedded={embedded} userType="SUPPLIER" />} />
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
    listeners.clear();
    auth.session = { userId: "me" };
    vi.mocked(api.createChatbotConversation).mockResolvedValue(assistant);
    vi.mocked(api.getConversation).mockResolvedValue(assistant);
    vi.mocked(api.getConversationMessages).mockResolvedValue([]);
    vi.mocked(api.getConversationMessagesSince).mockResolvedValue([]);
    vi.mocked(api.markConversationRead).mockResolvedValue(undefined);
    vi.mocked(api.sendConversationMessage).mockImplementation(async (conversationId, content, _type, clientMessageId) => ({
      id: "m1",
      conversationId,
      senderId: "me",
      content,
      timestamp: "2026-10-28T12:00:00Z",
      sequence: 1,
      clientMessageId,
      messageType: "USER_TO_CHATBOT",
    }));
    vi.mocked(subscribeToConversation).mockImplementation((_id, listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    });
  });

  it("opens an assistant conversation, sends the first message and waits for the reply", async () => {
    renderPage();
    send("Como comparar placas?");
    await waitFor(() => expect(api.createChatbotConversation).toHaveBeenCalledWith("SUPPLIER"));
    await waitFor(() => expect(api.sendConversationMessage).toHaveBeenCalledWith("bot-1", "Como comparar placas?", "CHAT_BOT", expect.any(String)));
    expect(await screen.findByText("O assistente está pensando...")).toBeInTheDocument();
    act(() =>
      listeners.forEach((listener) =>
        listener({
          kind: "message",
          change: "created",
          message: {
            id: "m2",
            conversationId: "bot-1",
            senderId: "assistant",
            content: "Compare potência e eficiência.",
            timestamp: "2026-10-28T12:00:05Z",
            sequence: 2,
            messageType: "CHATBOT_TO_USER",
            role: "assistant",
          },
        }),
      ),
    );
    expect(await screen.findByText("Compare potência e eficiência.")).toBeInTheDocument();
    expect(screen.queryByText("O assistente está pensando...")).not.toBeInTheDocument();
    expect(api.sendConversationMessage).toHaveBeenCalledTimes(1);
  });

  it("keeps the typed text and reports the error when the conversation cannot be created", async () => {
    vi.mocked(api.createChatbotConversation).mockRejectedValue(new Error("service is waking up"));
    renderPage();
    send("Preciso de ajuda");
    expect(await screen.findByText("Não foi possível iniciar a conversa. Tente novamente.")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("Preciso de ajuda");
    expect(api.sendConversationMessage).not.toHaveBeenCalled();
  });

  it("keeps the text of the first message for a resend when delivery fails", async () => {
    vi.mocked(api.sendConversationMessage).mockRejectedValueOnce(new Error("offline"));
    renderPage();
    send("Quero uma proposta");
    expect(await screen.findByText("Não foi possível enviar esta mensagem.")).toBeInTheDocument();
    expect(screen.getByText("Quero uma proposta")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reenviar" }));
    await waitFor(() => expect(screen.queryByText("Não foi possível enviar esta mensagem.")).not.toBeInTheDocument());
    expect(api.sendConversationMessage).toHaveBeenCalledTimes(2);
  });

  it("asks visitors without a session to sign in instead of pretending to answer", async () => {
    auth.session = null;
    renderPage(false);
    send("Olá");
    expect(await screen.findByText(/Entre na sua conta/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", expect.stringContaining("/pt-BR/"));
    expect(api.createChatbotConversation).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox")).toHaveValue("Olá");
  });
});
