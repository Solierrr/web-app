import { getAuthSession } from "@/shared/auth/authToken.utils";
import type { ConversationDto, MessageDto } from "./messenger.api";

interface MockMessenger {
  conversations: ConversationDto[];
  messages: MessageDto[];
}

function key(): string {
  return `solaria.mock.messenger.${getAuthSession()?.userId ?? "anonymous"}`;
}

export function getMockMessenger(): MockMessenger {
  try {
    return JSON.parse(localStorage.getItem(key()) ?? "null") ?? { conversations: [], messages: [] };
  } catch {
    return { conversations: [], messages: [] };
  }
}

export function getMockConversation(id: string): ConversationDto {
  return (
    getMockMessenger().conversations.find((item) => item.id === id) ?? {
      id,
      conversationType: "DIRECT",
      participantIds: [getAuthSession()?.userId ?? "mock-user", "mock-recipient"],
      title: null,
      lastInteractionAt: null,
      unreadCount: 0,
    }
  );
}

export function createMockConversation(recipientId: string): ConversationDto {
  const state = getMockMessenger();
  const existing = state.conversations.find((item) => item.participantIds.includes(recipientId));
  if (existing) return existing;
  const conversation = { ...getMockConversation(crypto.randomUUID()), participantIds: [getAuthSession()?.userId ?? "mock-user", recipientId] };
  localStorage.setItem(key(), JSON.stringify({ ...state, conversations: [...state.conversations, conversation] }));
  return conversation;
}

export function sendMockMessage(conversationId: string, content: string): MessageDto {
  const state = getMockMessenger();
  const sequence = Math.max(0, ...state.messages.filter((item) => item.conversationId === conversationId).map((item) => item.sequence)) + 1;
  const message: MessageDto = {
    id: crypto.randomUUID(),
    conversationId,
    senderId: getAuthSession()?.userId ?? "mock-user",
    content,
    timestamp: new Date().toISOString(),
    sequence,
  };
  const conversation = { ...getMockConversation(conversationId), lastInteractionAt: message.timestamp };
  localStorage.setItem(
    key(),
    JSON.stringify({
      conversations: [...state.conversations.filter((item) => item.id !== conversationId), conversation],
      messages: [...state.messages, message],
    }),
  );
  return message;
}
