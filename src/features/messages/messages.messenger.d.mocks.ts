import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import type { ConversationDto, MessageDto } from "./messages.messenger.api";

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
  const existing = state.conversations.find((item) => item.conversationType === "DIRECT" && item.participantIds.includes(recipientId));
  if (existing) return existing;
  const conversation = { ...getMockConversation(crypto.randomUUID()), participantIds: [getAuthSession()?.userId ?? "mock-user", recipientId] };
  localStorage.setItem(key(), JSON.stringify({ ...state, conversations: [...state.conversations, conversation] }));
  window.dispatchEvent(new Event("solaria:messenger"));
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
    role: "user",
    messageType:
      getMockConversation(conversationId).conversationType === "GROUP"
        ? "USER_TO_GROUP"
        : getMockConversation(conversationId).conversationType === "CHAT_BOT"
          ? "USER_TO_CHATBOT"
          : "USER_TO_USER",
  };
  const conversation = { ...getMockConversation(conversationId), lastInteractionAt: message.timestamp };
  localStorage.setItem(
    key(),
    JSON.stringify({
      conversations: [...state.conversations.filter((item) => item.id !== conversationId), conversation],
      messages: [...state.messages, message],
    }),
  );
  window.dispatchEvent(new Event("solaria:messenger"));
  return message;
}

export function createMockChatbotConversation(): ConversationDto {
  const state = getMockMessenger();
  const conversation: ConversationDto = {
    id: crypto.randomUUID(),
    conversationType: "CHAT_BOT",
    participantIds: [getAuthSession()?.userId ?? "mock-user"],
    title: null,
    lastInteractionAt: new Date().toISOString(),
    unreadCount: 0,
  };
  localStorage.setItem(key(), JSON.stringify({ ...state, conversations: [...state.conversations, conversation] }));
  window.dispatchEvent(new Event("solaria:messenger"));
  return conversation;
}

export function markMockConversationRead(id: string): ConversationDto {
  const state = getMockMessenger();
  const conversation = { ...getMockConversation(id), unreadCount: 0 };
  if (state.conversations.some((item) => item.id === id && item.unreadCount !== 0)) {
    localStorage.setItem(
      key(),
      JSON.stringify({ ...state, conversations: state.conversations.map((item) => (item.id === id ? conversation : item)) }),
    );
    window.dispatchEvent(new Event("solaria:messenger"));
  }
  return conversation;
}
