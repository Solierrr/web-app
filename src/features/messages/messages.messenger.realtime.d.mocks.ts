import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import type { ConversationDto, MessageDto } from "./messages.messenger.api";
import { userTopic } from "./messages.messenger.realtime.utils";
import { emitMockFrame } from "./messages.messenger.socket";

const ASSISTANT_REPLY_DELAY_MS = 1_800;
const PEER_TYPING_DELAY_MS = 600;
const PEER_REPLY_DELAY_MS = 2_200;

export type MockReply = Pick<MessageDto, "senderId" | "content" | "role" | "messageType">;

let syncVersion = 0;

function currentUserId(): string {
  return getAuthSession()?.userId ?? "mock-user";
}

export function publishMockMessage(message: MessageDto, change: "created" | "edited" | "deleted" = "created"): void {
  emitMockFrame(userTopic(currentUserId(), "events"), {
    type: `MESSAGE_${change.toUpperCase()}`,
    conversationId: message.conversationId,
    eventId: message.id,
    payload: message,
  });
}

export function publishMockConversation(conversation: ConversationDto): void {
  syncVersion += 1;
  emitMockFrame(userTopic(currentUserId(), "events"), {
    type: "CONVERSATION_UPDATED",
    conversationId: conversation.id,
    payload: { ...conversation, syncEpoch: "mock", syncVersion },
  });
}

function peerOf(conversation: ConversationDto): string | undefined {
  return conversation.participantIds.find((id) => id !== currentUserId());
}

/** Presence snapshot of the contacts, sent right after the screen subscribes, like the real broker does (one channel for the whole user). */
export function announceMockPresence(conversation: ConversationDto): void {
  const peer = peerOf(conversation);
  if (conversation.conversationType !== "DIRECT" || !peer) return;
  setTimeout(() => {
    emitMockFrame(userTopic(currentUserId(), "events"), {
      type: "PRESENCE_SNAPSHOT",
      payload: { users: { [currentUserId().toLowerCase()]: true, [peer.toLowerCase()]: true }, presenceEpoch: "mock", presenceVersion: 1 },
    });
  }, 0);
}

/** Answers a user message the way the backend would: the assistant replies after a delay, a direct contact types first. */
export function simulateMockReplies(conversation: ConversationDto, receive: (conversationId: string, reply: MockReply) => void): void {
  if (conversation.conversationType === "CHAT_BOT") {
    setTimeout(
      () =>
        receive(conversation.id, {
          senderId: "assistant",
          content: "Posso ajudar com isso. Me conte um pouco mais sobre o seu caso.",
          role: "assistant",
          messageType: "CHATBOT_TO_USER",
        }),
      ASSISTANT_REPLY_DELAY_MS,
    );
    return;
  }
  const peer = peerOf(conversation);
  if (conversation.conversationType !== "DIRECT" || !peer) return;
  const typing = (started: boolean) =>
    emitMockFrame(userTopic(currentUserId(), "events"), {
      type: started ? "TYPING_STARTED" : "TYPING_STOPPED",
      conversationId: conversation.id,
      payload: { userId: peer.toLowerCase() },
    });
  setTimeout(() => typing(true), PEER_TYPING_DELAY_MS);
  setTimeout(() => {
    typing(false);
    receive(conversation.id, { senderId: peer, content: "Recebi sua mensagem! Já te respondo.", role: "user", messageType: "USER_TO_USER" });
  }, PEER_REPLY_DELAY_MS);
}
