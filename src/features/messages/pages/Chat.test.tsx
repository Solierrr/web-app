import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Chat from "./Chat";
import * as api from "@/features/messages/messenger.api";
import { subscribeToConversation } from "@/features/messages/messenger.socket";

vi.mock("@/features/messages/messenger.api", () => ({
  getConversation: vi.fn(), getConversationMessages: vi.fn(), getConversationMessagesSince: vi.fn(),
  getUserSummary: vi.fn(), markConversationRead: vi.fn(), sendConversationMessage: vi.fn(),
}));
vi.mock("@/features/messages/messenger.socket", () => ({ subscribeToConversation: vi.fn() }));
vi.mock("@/shared/auth/authToken.utils", () => ({ getAuthSession: () => ({ userId: "me" }) }));

const conversation: api.ConversationDto = {
  id: "conv-1", conversationType: "DIRECT", participantIds: ["me", "supplier"],
  title: null, lastInteractionAt: null, unreadCount: 0,
};
const message = (sequence: number, content: string): api.MessageDto => ({
  id: `msg-${sequence}`, conversationId: "conv-1", senderId: "supplier", sequence,
  content, timestamp: "2026-09-28T12:00:00Z",
});

function renderChat() {
  return render(<MemoryRouter initialEntries={["/pt-BR/mensagens/conv-1"]}>
    <Routes><Route path="/:lang/mensagens/:conversationId" element={<Chat />} /></Routes>
  </MemoryRouter>);
}

describe("Chat", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.getConversation).mockResolvedValue(conversation);
    vi.mocked(api.getConversationMessages).mockResolvedValue([]);
    vi.mocked(api.getConversationMessagesSince).mockResolvedValue([]);
    vi.mocked(api.getUserSummary).mockResolvedValue({ username: "Fornecedor", avatar: null });
    vi.mocked(api.markConversationRead).mockResolvedValue(conversation);
    vi.mocked(subscribeToConversation).mockReturnValue(() => undefined);
  });

  it("preserves live messages that arrive while history is still loading", async () => {
    let finishHistory!: (messages: api.MessageDto[]) => void;
    vi.mocked(api.getConversationMessages).mockReturnValue(new Promise((resolve) => { finishHistory = resolve; }));
    renderChat();
    act(() => { vi.mocked(subscribeToConversation).mock.calls[0][1](message(2, "Mensagem ao vivo")); });
    await act(async () => { finishHistory([message(1, "Mensagem anterior")]); });
    expect(await screen.findByText("Mensagem anterior")).toBeInTheDocument();
    expect(screen.getByText("Mensagem ao vivo")).toBeInTheDocument();
    await waitFor(() => expect(api.markConversationRead).toHaveBeenCalledWith("conv-1", 2));
  });

  it("deduplicates the REST response and live event for a sent message", async () => {
    const sent = { ...message(1, "Tenho interesse"), senderId: "me" };
    vi.mocked(api.sendConversationMessage).mockImplementation(async () => {
      vi.mocked(subscribeToConversation).mock.calls[0][1](sent);
      return sent;
    });
    renderChat();
    await screen.findByRole("heading", { name: "Fornecedor" });
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Tenho interesse" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
    await waitFor(() => expect(screen.getAllByText("Tenho interesse")).toHaveLength(1));
    expect(api.sendConversationMessage).toHaveBeenCalledWith("conv-1", "Tenho interesse");
  });

  it("does not enable sending when the conversation cannot be loaded", async () => {
    vi.mocked(api.getConversation).mockRejectedValue(new Error("forbidden"));
    renderChat();
    await screen.findByRole("alert");
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Mensagem" } });
    expect(screen.getByRole("button", { name: "Enviar" })).toBeDisabled();
  });
});
