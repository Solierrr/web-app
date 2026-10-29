import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import type { ConversationDto, MessageDto } from "./messages.messenger.api";
import { conversationTopic, userTopic } from "./messages.messenger.realtime.utils";
import { emitMockFrame } from "./messages.messenger.socket";

const ASSISTANT_REPLY_DELAY_MS = 1_800;
const PEER_TYPING_DELAY_MS = 600;
const PEER_REPLY_DELAY_MS = 2_200;

export type MockReply = Pick<MessageDto, "senderId" | "content" | "role" | "messageType">;

let syncVersion = 0;

function currentUserId(): string {
  return getAuthSession()?.userId ?? "mock-user";
}

export function publishMockMessage(message: MessageDto): void {
  emitMockFrame(conversationTopic(message.conversationId), {
    type: "MESSAGE_CREATED",
    conversationId: message.conversationId,
    eventId: message.id,
    payload: message,
  });
}

export function publishMockConversation(conversation: ConversationDto): void {
  syncVersion += 1;
  emitMockFrame(userTopic(currentUserId(), "conversations"), {
    type: "CONVERSATION_UPDATED",
    conversationId: conversation.id,
    payload: { ...conversation, syncEpoch: "mock", syncVersion },
  });
}

function peerOf(conversation: ConversationDto): string | undefined {
  return conversation.participantIds.find((id) => id !== currentUserId());
}

/** Presence snapshot of a direct conversation, sent right after the screen subscribes, like the real broker does. */
export function announceMockPresence(conversation: ConversationDto): void {
  const peer = peerOf(conversation);
  if (conversation.conversationType !== "DIRECT" || !peer) return;
  setTimeout(() => {
    emitMockFrame(conversationTopic(conversation.id), {
      type: "PRESENCE_SNAPSHOT",
      conversationId: conversation.id,
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
    emitMockFrame(conversationTopic(conversation.id), {
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
