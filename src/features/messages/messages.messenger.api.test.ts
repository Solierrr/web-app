import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getConversations,
  getConversationMessages,
  getConversationMessagesSince,
  markConversationRead,
  sendConversationMessage,
  type MessageDto,
} from "./messages.messenger.api";

vi.mock("@/config/logging/logger", () => ({ default: { serviceError: vi.fn() } }));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => ({ accessToken: "test-token" }) }));

const message = (sequence: number): MessageDto => ({
  id: String(sequence),
  conversationId: "conv-1",
  senderId: "sender",
  content: "Hello",
  timestamp: "2026-10-07T12:00:00Z",
  sequence,
});
const fetchMock = vi.fn();
function respond(body: unknown, status = 200) {
  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));
}

describe("Messenger API contract", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_MOCKS", "ALWAYS");
    vi.stubEnv("VITE_MESSENGER_MOCKS", "DEACTIVATED");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("uses real conversations and the bearer token even when other pages use mocks", async () => {
    respond([]);
    await expect(getConversations()).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/messaging/conversations/me"),
      expect.objectContaining({ headers: { Authorization: "Bearer test-token" } }),
    );
  });
  it("propagates API errors instead of showing mock conversations", async () => {
    respond({ code: "UNAUTHORIZED" }, 401);
    await expect(getConversations()).rejects.toThrow();
  });
  it("loads the latest page of history with a single request", async () => {
    respond(Array.from({ length: 100 }, (_, index) => message(index + 36)));
    const result = await getConversationMessages("conv-1");
    expect(result).toHaveLength(100);
    expect(result[0].sequence).toBe(36);
    expect(result[99].sequence).toBe(135);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain("/messages/conversation/conv-1?limit=100");
    expect(fetchMock.mock.calls[0][0]).not.toContain("Sequence=");
  });
  it("loads older messages with the beforeSequence cursor", async () => {
    respond(Array.from({ length: 35 }, (_, index) => message(index + 1)));
    const result = await getConversationMessages("conv-1", 36);
    expect(result.map((item) => item.sequence)).toEqual(Array.from({ length: 35 }, (_, index) => index + 1));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain("/messages/conversation/conv-1?limit=100&beforeSequence=36");
  });
  it("synchronizes messages after a known sequence", async () => {
    respond([message(8)]);
    await getConversationMessagesSince("conv-1", 7);
    expect(fetchMock.mock.calls[0][0]).toContain("/messages/conversation/conv-1?sinceSequence=7&limit=100");
  });
  it("saves the read cursor through the conversation state endpoint", async () => {
    respond({ conversationId: "conv-1", lastReadSequence: 5, unreadCount: 0 });
    await markConversationRead("conv-1", 5, "DIRECT");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/messaging/conversations/conv-1/state"),
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ lastReadSequence: 5 }) }),
    );
  });
  it("does not save a read cursor for assistant conversations or empty history", async () => {
    await markConversationRead("conv-1", 5, "CHAT_BOT");
    await markConversationRead("conv-1", 0, "DIRECT");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("correlates a sent message with the client message id", async () => {
    respond(message(1), 201);
    await sendConversationMessage("conv-1", "Hello", "DIRECT", "0b9c7a4e-6d1f-4c5e-9a43-2f7d8e1b6a10");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/messaging/messages"),
      expect.objectContaining({
        body: JSON.stringify({
          conversationId: "conv-1",
          clientMessageId: "0b9c7a4e-6d1f-4c5e-9a43-2f7d8e1b6a10",
          messageType: "USER_TO_USER",
          content: "Hello",
        }),
      }),
    );
  });
  it.each([
    ["DIRECT", "USER_TO_USER"],
    ["GROUP", "USER_TO_GROUP"],
    ["CHAT_BOT", "USER_TO_CHATBOT"],
  ] as const)("sends %s using the correct message type", async (type, messageType) => {
    respond(message(1), 201);
    await sendConversationMessage("conv-1", "Hello", type);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/messaging/messages"),
      expect.objectContaining({ method: "POST", body: JSON.stringify({ conversationId: "conv-1", messageType, content: "Hello" }) }),
    );
  });
});
