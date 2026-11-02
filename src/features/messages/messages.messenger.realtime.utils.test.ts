import { describe, expect, it } from "vitest";
import type { ConversationDto, MessageDto } from "./messages.messenger.api";
import {
  applyPresence,
  classifyDestination,
  EMPTY_PRESENCE,
  frameConversationId,
  highestSequence,
  mergeConversation,
  mergeMessages,
  parseConversationFrame,
  parseUserFrame,
  presenceEvents,
  removeConversation,
  toConversationDto,
  userTopic,
} from "./messages.messenger.realtime.utils";

const message = (sequence: number, extra: Partial<MessageDto> = {}): MessageDto => ({
  id: `msg-${sequence}`,
  conversationId: "conv-1",
  senderId: "sender",
  content: `Message ${sequence}`,
  timestamp: "2026-10-28T12:00:00Z",
  sequence,
  ...extra,
});

const conversation = (id: string, extra: Partial<ConversationDto> = {}): ConversationDto => ({
  id,
  conversationType: "DIRECT",
  participantIds: ["me", "other"],
  title: null,
  lastInteractionAt: null,
  unreadCount: 0,
  ...extra,
});

describe("topics", () => {
  it("uses the private user topic with a lowercase id, the only one the broker accepts", () => {
    expect(userTopic("0B9C7A4E-6D1F-4C5E-9A43-2F7D8E1B6A10", "events")).toBe("/topic/users.0b9c7a4e-6d1f-4c5e-9a43-2f7d8e1b6a10.events");
  });
  it("classifies only the destinations of the contract", () => {
    expect(classifyDestination("/topic/users.0b9c7a4e-6d1f-4c5e-9a43-2f7d8e1b6a10.events")).toBe("events");
    expect(classifyDestination("/topic/users.0b9c7a4e-6d1f-4c5e-9a43-2f7d8e1b6a10.errors")).toBe("errors");
    expect(classifyDestination("/topic/conversations.abc_1-2")).toBeNull();
    expect(classifyDestination("/topic/users.0b9c7a4e-6d1f-4c5e-9a43-2f7d8e1b6a10.conversations")).toBeNull();
    expect(classifyDestination("/topic/users.*.acks")).toBeNull();
    expect(classifyDestination("/topic/users.other.unknown")).toBeNull();
  });
  it("reads the conversation of a frame from the envelope, falling back to the message payload", () => {
    expect(frameConversationId({ type: "TYPING_STARTED", conversationId: "conv-1", payload: { userId: "a" } })).toBe("conv-1");
    expect(frameConversationId({ type: "MESSAGE_CREATED", payload: message(1) })).toBe("conv-1");
    expect(frameConversationId({ type: "USER_ONLINE", conversationId: null, payload: { userId: "a" } })).toBeUndefined();
    expect(frameConversationId("text")).toBeUndefined();
  });
});

describe("mergeMessages", () => {
  it("does not duplicate a message that arrives from history and from the live topic", () => {
    const history = [message(1), message(2)];
    const live = [message(2), message(3)];
    expect(mergeMessages(history, live).map((item) => item.sequence)).toEqual([1, 2, 3]);
  });
  it("keeps a message received live while the history request was still loading", () => {
    const live = [message(5)];
    const history = [message(3), message(4), message(5)];
    expect(mergeMessages(live, history).map((item) => item.id)).toEqual(["msg-3", "msg-4", "msg-5"]);
  });
  it("orders by sequence and lets an edit or deletion replace the stored message", () => {
    const merged = mergeMessages([message(2), message(1)], [message(2, { content: "", deleted: true })]);
    expect(merged.map((item) => item.sequence)).toEqual([1, 2]);
    expect(merged[1]).toMatchObject({ deleted: true, content: "" });
  });
  it("finds the highest known sequence", () => {
    expect(highestSequence([message(2), message(9), message(4)])).toBe(9);
    expect(highestSequence([], 7)).toBe(7);
  });
});

describe("conversation list", () => {
  it("adds a new conversation and replaces a known one", () => {
    const list = mergeConversation([conversation("a")], conversation("b"));
    expect(list.map((item) => item.id)).toEqual(["a", "b"]);
    expect(mergeConversation(list, conversation("a", { unreadCount: 2 })).find((item) => item.id === "a")?.unreadCount).toBe(2);
  });
  it("ignores an older version of the same epoch and accepts a newer epoch", () => {
    const list = [conversation("a", { unreadCount: 5, syncEpoch: "e1", syncVersion: 10 })];
    expect(mergeConversation(list, conversation("a", { unreadCount: 1, syncEpoch: "e1", syncVersion: 9 }))[0].unreadCount).toBe(5);
    expect(mergeConversation(list, conversation("a", { unreadCount: 0, syncEpoch: "e1", syncVersion: 11 }))[0].unreadCount).toBe(0);
    expect(mergeConversation(list, conversation("a", { unreadCount: 2, syncEpoch: "e2", syncVersion: 1 }))[0].unreadCount).toBe(2);
  });
  it("removes a conversation", () => {
    expect(removeConversation([conversation("a"), conversation("b")], "a").map((item) => item.id)).toEqual(["b"]);
  });
});

describe("payload parsing", () => {
  it("maps the backend list projection to the conversation model", () => {
    expect(
      toConversationDto({
        id: "conv-1",
        conversationType: "GROUP",
        participantIds: ["a", "b"],
        title: "Project",
        communityId: "c1",
        lastReadSequence: 3,
        unreadCount: 4,
        syncEpoch: "e1",
        syncVersion: 12,
        lastMessage: { id: "m", sequence: 7, timestamp: "2026-10-28T10:00:00Z" },
      }),
    ).toEqual({
      id: "conv-1",
      conversationType: "GROUP",
      participantIds: ["a", "b"],
      title: "Project",
      lastInteractionAt: "2026-10-28T10:00:00Z",
      unreadCount: 4,
      lastReadSequence: 3,
      syncEpoch: "e1",
      syncVersion: 12,
      communityId: "c1",
    });
  });
  it("rejects payloads without the required fields", () => {
    expect(toConversationDto({ title: "x" })).toBeNull();
    expect(parseConversationFrame({ type: "MESSAGE_CREATED", payload: { id: "m" } })).toBeNull();
    expect(parseConversationFrame({ type: "UNKNOWN" })).toBeNull();
    expect(parseConversationFrame("text")).toBeNull();
    expect(parseUserFrame({ type: "CONVERSATION_REMOVED", payload: {} })).toBeNull();
    expect(parseUserFrame({ type: "OTHER" })).toBeNull();
  });
});

describe("presence", () => {
  const online = (userId: string, version: number, extra = {}) => ({
    kind: "presence" as const,
    userId,
    online: true,
    epoch: "e1",
    version,
    ...extra,
  });
  it("starts from the snapshot and applies live changes", () => {
    const state = applyPresence(EMPTY_PRESENCE, { kind: "presenceSnapshot", users: { a: true, b: false }, epoch: "e1", version: 5 });
    expect(state.users).toEqual({ a: true, b: false });
    const next = applyPresence(state, { kind: "presence", userId: "a", online: false, epoch: "e1", version: 6 });
    expect(next.users.a).toBe(false);
  });
  it("adds a partial snapshot to the people already known instead of replacing them", () => {
    const first = applyPresence(EMPTY_PRESENCE, { kind: "presenceSnapshot", users: { a: true, b: false }, epoch: "e1", version: 5 });
    const second = applyPresence(first, { kind: "presenceSnapshot", users: { c: true }, epoch: "e1", version: 7 });
    expect(second.users).toEqual({ a: true, b: false, c: true });
    expect(second.markers.a).toEqual({ epoch: "e1", version: 5 });
    expect(second.markers.c).toEqual({ epoch: "e1", version: 7 });
  });
  it("keeps the newer state of a person when an older snapshot mentions them again", () => {
    const state = applyPresence(EMPTY_PRESENCE, online("a", 8));
    const next = applyPresence(state, { kind: "presenceSnapshot", users: { a: false, b: true }, epoch: "e1", version: 6 });
    expect(next.users).toEqual({ a: true, b: true });
    expect(next.markers.a).toEqual({ epoch: "e1", version: 8 });
  });
  it("drops a change that is older than the last one seen for the same user and epoch", () => {
    const state = applyPresence(EMPTY_PRESENCE, online("a", 8));
    const stale = applyPresence(state, { kind: "presence", userId: "a", online: false, epoch: "e1", version: 7 });
    expect(stale).toBe(state);
    expect(applyPresence(state, { kind: "presence", userId: "a", online: false, epoch: "e2", version: 1 }).users.a).toBe(false);
  });
  it("replays the known presence as one event per person, with each version", () => {
    const state = applyPresence(applyPresence(EMPTY_PRESENCE, online("a", 3)), {
      kind: "presenceSnapshot",
      users: { b: false },
      epoch: "e1",
      version: 9,
    });
    expect(presenceEvents(state)).toEqual([
      { kind: "presence", userId: "a", online: true, epoch: "e1", version: 3 },
      { kind: "presence", userId: "b", online: false, epoch: "e1", version: 9 },
    ]);
    expect(presenceEvents(EMPTY_PRESENCE)).toEqual([]);
  });
});
