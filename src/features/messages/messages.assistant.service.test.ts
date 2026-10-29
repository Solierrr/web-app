import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendAssistantTurn } from "@/features/assistant/assistant.service";
import { getConversation } from "./messages.messenger.api";
import { findAssistantConversation, getAssistantThread, rememberAssistantThread } from "./messages.assistant.utils";
import { startAssistantConversation } from "./messages.assistant.service";

vi.mock("@/features/assistant/assistant.service", () => ({ sendAssistantTurn: vi.fn() }));
vi.mock("./messages.messenger.api", () => ({ getConversation: vi.fn() }));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => ({ userId: "me" }) }));

describe("assistant conversations", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it("opens the conversation through the agent and remembers which thread belongs to it", async () => {
    vi.mocked(sendAssistantTurn).mockResolvedValue({ response: "Olá!", messengerConversationId: "conv-1" });
    vi.mocked(getConversation).mockResolvedValue({
      id: "conv-1",
      conversationType: "CHAT_BOT",
      participantIds: ["me"],
      title: null,
      lastInteractionAt: null,
    });
    const refreshed = vi.fn();
    window.addEventListener("solaria:messenger", refreshed);

    const conversation = await startAssistantConversation("Quero uma placa");

    const threadId = vi.mocked(sendAssistantTurn).mock.calls[0][0];
    expect(threadId).toMatch(/^[0-9a-f-]{36}$/);
    expect(vi.mocked(sendAssistantTurn).mock.calls[0][1]).toBe("Quero uma placa");
    expect(conversation.id).toBe("conv-1");
    expect(getAssistantThread("conv-1")).toBe(threadId);
    expect(findAssistantConversation(threadId)).toBe("conv-1");
    expect(refreshed).toHaveBeenCalled();
    window.removeEventListener("solaria:messenger", refreshed);
  });

  it("still returns the conversation when reading it back fails", async () => {
    vi.mocked(sendAssistantTurn).mockResolvedValue({ response: "Olá!", messengerConversationId: "conv-2" });
    vi.mocked(getConversation).mockRejectedValue(new Error("offline"));

    await expect(startAssistantConversation("Oi")).resolves.toMatchObject({ id: "conv-2", conversationType: "CHAT_BOT" });
  });

  it("does not create a conversation when the agent fails", async () => {
    vi.mocked(sendAssistantTurn).mockRejectedValue(new Error("down"));

    await expect(startAssistantConversation("Oi")).rejects.toThrow("down");
    expect(getConversation).not.toHaveBeenCalled();
  });

  it("falls back to the conversation id as the thread and keeps only recent links", () => {
    expect(getAssistantThread("unknown")).toBe("unknown");
    for (let index = 0; index < 60; index += 1) rememberAssistantThread(`conv-${index}`, `thread-${index}`);
    expect(getAssistantThread("conv-0")).toBe("conv-0");
    expect(getAssistantThread("conv-59")).toBe("thread-59");
  });
});
