import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createChatbotConversation,
  createDirectConversation,
  getConversation,
  markConversationRead,
  sendConversationMessage,
} from "./messages.messenger.api";
import type { ConversationEvent, UserEvent } from "./messages.messenger.realtime";
import { subscribeToConversation, subscribeToUserEvents, getConnectionState, disconnectMessenger } from "./messages.messenger.socket";

const USER_ID = "0b9c7a4e-6d1f-4c5e-9a43-2f7d8e1b6a10";
const PEER_ID = "7e2a1d90-3b44-4a8e-b3c1-5d6f9a0c2e88";

vi.mock("@/lib/shared/auth/authToken.utils", () => ({
  getAuthSession: () => ({ userId: USER_ID, accessToken: "t", accessTokenExpiresAt: "2999-01-01T00:00:00Z" }),
}));
vi.mock("@/config/logging/logger", () => ({ default: { serviceError: vi.fn(), debug: vi.fn() } }));

describe("simulated realtime events", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv("VITE_MESSENGER_MOCKS", "ALWAYS");
    vi.stubEnv("VITE_MOCKS_DELAY_SECONDS", "0");
    localStorage.clear();
  });
  afterEach(() => {
    disconnectMessenger();
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("reports a connected state and streams the assistant reply through the conversation topic", async () => {
    const conversation = await createChatbotConversation("PERSONAL");
    const events: ConversationEvent[] = [];
    const updates: UserEvent[] = [];
    subscribeToConversation(conversation.id, (event) => events.push(event));
    subscribeToUserEvents((event) => updates.push(event));
    expect(getConnectionState().status).toBe("connected");

    const sent = await sendConversationMessage(conversation.id, "Quanto custa?", "CHAT_BOT", "6f1d2c3b-9a8e-4d7c-b5a4-0e1f2a3b4c5d");
    expect(events).toEqual([expect.objectContaining({ kind: "message", change: "created", message: expect.objectContaining({ id: sent.id }) })]);

    await vi.advanceTimersByTimeAsync(1_800);
    expect(events).toHaveLength(2);
    expect(events[1]).toMatchObject({ kind: "message", message: { messageType: "CHATBOT_TO_USER", sequence: sent.sequence + 1 } });
    const last = updates[updates.length - 1];
    expect(last).toMatchObject({ kind: "conversationUpdated", conversation: { id: conversation.id, unreadCount: 1 } });
  });

  it("clears the unread badge through the same user topic when the conversation is read", async () => {
    const conversation = await createChatbotConversation("PERSONAL");
    await sendConversationMessage(conversation.id, "Oi", "CHAT_BOT");
    await vi.advanceTimersByTimeAsync(1_800);
    const updates: UserEvent[] = [];
    subscribeToUserEvents((event) => updates.push(event));
    await markConversationRead(conversation.id, 2, "DIRECT");
    expect(updates).toEqual([expect.objectContaining({ kind: "conversationUpdated", conversation: expect.objectContaining({ unreadCount: 0 }) })]);
  });

  it("simulates presence, typing and a reply from a direct contact", async () => {
    const conversation = await createDirectConversation(PEER_ID);
    const events: ConversationEvent[] = [];
    subscribeToConversation(conversation.id, (event) => events.push(event));
    await getConversation(conversation.id);
    await vi.advanceTimersByTimeAsync(0);
    expect(events[0]).toMatchObject({ kind: "presenceSnapshot", users: { [PEER_ID]: true } });

    await sendConversationMessage(conversation.id, "Oi", "DIRECT");
    await vi.advanceTimersByTimeAsync(2_200);
    expect(events.map((event) => event.kind)).toEqual(["presenceSnapshot", "message", "typing", "typing", "message"]);
    expect(events[2]).toMatchObject({ typing: true, userId: PEER_ID });
    expect(events[3]).toMatchObject({ typing: false });
  });
});
