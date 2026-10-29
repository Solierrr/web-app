import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AssistantEntry from "./AssistantEntry";
import { startAssistantConversation } from "@/features/messages/messages.assistant.service";
import { AgentChatError } from "@/features/error/agent-chat/AgentChat.error";

const activeContext = vi.hoisted(() => ({ value: { kind: "personal", company: null } as { kind: string; company: { id: string } | null } }));

vi.mock("@/lib/shared/context/ActiveContext", () => ({ useActiveContext: () => activeContext.value }));
vi.mock("@/features/messages/messages.assistant.service", () => ({ startAssistantConversation: vi.fn() }));
vi.mock("@/features/assistant/pages/OperationalAssistant", () => ({ default: () => <p>assistente operacional</p> }));
vi.mock("@@/layout/access/canvas/SideCanvas", () => ({ default: () => null }));

function renderEntry() {
  return render(
    <MemoryRouter initialEntries={["/pt-BR/painel/assistente"]}>
      <Routes>
        <Route path="/:lang/painel/assistente" element={<AssistantEntry />} />
        <Route path="/:lang/mensagens/:conversationId" element={<p>conversa aberta</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

function send(text: string) {
  fireEvent.change(screen.getByRole("textbox"), { target: { value: text } });
  fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem ao assistente" }));
}

describe("AssistantEntry", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    activeContext.value = { kind: "personal", company: null };
  });

  it("uses the operational assistant inside a company", () => {
    activeContext.value = { kind: "company", company: { id: "company-1" } };
    renderEntry();

    expect(screen.getByText("assistente operacional")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("opens the conversation created by the agent for a personal context", async () => {
    vi.mocked(startAssistantConversation).mockResolvedValue({
      id: "bot-1",
      conversationType: "CHAT_BOT",
      participantIds: [],
      title: null,
      lastInteractionAt: null,
    });
    renderEntry();
    send("Quero uma placa");

    await waitFor(() => expect(startAssistantConversation).toHaveBeenCalledWith("Quero uma placa"));
    expect(await screen.findByText("conversa aberta")).toBeInTheDocument();
  });

  it("shows why the agent failed and keeps the text for a new attempt", async () => {
    vi.mocked(startAssistantConversation).mockRejectedValue(
      new AgentChatError("timeout", "O assistente demorou demais para responder. Tente novamente."),
    );
    renderEntry();
    send("Quero uma placa");

    expect(await screen.findByText("O assistente demorou demais para responder. Tente novamente.")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("Quero uma placa");
  });
});
