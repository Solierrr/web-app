import i18n from "@/config/i18n/internationalization";
import { httpJson } from "@/lib/shared/http/http.service";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import {
  getMockMessenger,
  getMockConversation,
  createMockConversation,
  createMockChatbotConversation,
  sendMockMessage,
  markMockConversationRead,
  getMockConnections,
  addMockConnection,
} from "./messages.messenger.d.mocks";
import { userMocks } from "@/config/mocks/registry";

const API = `${import.meta.env.VITE_API_MESSENGER?.replace(/\/$/, "")}/messaging`;

export interface ConversationDto {
  id: string;
  conversationType: "DIRECT" | "GROUP" | "CHAT_BOT";
  participantIds: string[];
  title: string | null;
  lastInteractionAt: string | null;
  unreadCount?: number;
  communityId?: string | null;
  projectGeneral?: boolean;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  sequence: number;
  role?: string;
  messageType?: "USER_TO_USER" | "USER_TO_GROUP" | "USER_TO_CHATBOT" | "CHATBOT_TO_USER";
}

export async function getConversations(): Promise<ConversationDto[]> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return getMockMessenger().conversations;
  }
  return httpJson<ConversationDto[]>(`${API}/conversations/me`, {
    service: "messenger",
    operation: "getConversations",
    errorMessage: i18n.t("services:messenger.getConversations"),
  });
}

export async function getConversation(id: string): Promise<ConversationDto> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return getMockConversation(id);
  }
  return httpJson<ConversationDto>(`${API}/conversations/${encodeURIComponent(id)}`, {
    service: "messenger",
    operation: "getConversation",
    errorMessage: i18n.t("services:messenger.getConversation"),
  });
}

export async function createDirectConversation(recipientId: string): Promise<ConversationDto> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return createMockConversation(recipientId);
  }
  return httpJson<ConversationDto>(`${API}/conversations/direct`, {
    service: "messenger",
    operation: "createDirectConversation",
    method: "POST",
    body: { recipientId },
    errorMessage: i18n.t("services:messenger.createDirectConversation"),
  });
}

export async function getConversationMessages(id: string, beforeSequence?: number): Promise<MessageDto[]> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return getMockMessenger()
      .messages.filter((item) => item.conversationId === id && (beforeSequence === undefined || item.sequence < beforeSequence))
      .slice(-100);
  }
  const messages: MessageDto[] = [];
  let cursor = 0;
  while (true) {
    const page = await getConversationMessagesSince(id, cursor);
    messages.push(...page);
    const next = page.reduce((highest, message) => Math.max(highest, message.sequence), cursor);
    if (page.length < 100 || next <= cursor || (beforeSequence !== undefined && next >= beforeSequence)) break;
    cursor = next;
  }
  return messages.filter((message) => beforeSequence === undefined || message.sequence < beforeSequence).slice(-100);
}

export async function getConversationMessagesSince(id: string, sequence: number): Promise<MessageDto[]> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return getMockMessenger().messages.filter((item) => item.conversationId === id && item.sequence > sequence);
  }
  return httpJson<MessageDto[]>(`${API}/messages/conversation/${encodeURIComponent(id)}?sinceSequence=${sequence}&limit=100`, {
    service: "messenger",
    operation: "syncConversationMessages",
    errorMessage: i18n.t("services:messenger.syncConversationMessages"),
  });
}

export async function markConversationRead(id: string, sequence: number): Promise<ConversationDto | undefined> {
  if (!isAlwaysMockMode("MESSENGER")) return;
  await waitForMockService();
  if (sequence > 0) return markMockConversationRead(id);
}

export async function sendConversationMessage(
  conversationId: string,
  content: string,
  conversationType: ConversationDto["conversationType"] = "DIRECT",
): Promise<MessageDto> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return sendMockMessage(conversationId, content);
  }
  return httpJson<MessageDto>(`${API}/messages`, {
    service: "messenger",
    operation: "sendConversationMessage",
    method: "POST",
    body: {
      conversationId,
      messageType: conversationType === "GROUP" ? "USER_TO_GROUP" : conversationType === "CHAT_BOT" ? "USER_TO_CHATBOT" : "USER_TO_USER",
      content,
    },
    errorMessage: i18n.t("services:messenger.sendConversationMessage"),
  });
}

export async function createChatbotConversation(userType: string): Promise<ConversationDto> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return createMockChatbotConversation();
  }
  return httpJson<ConversationDto>(`${API}/conversations/chatbot-conversations`, {
    service: "messenger",
    operation: "createChatbotConversation",
    method: "POST",
    body: { userType },
    errorMessage: i18n.t("chat:createError"),
  });
}

export interface MessengerContact {
  authId: string;
  username: string;
  avatar: string | null;
}

export async function getMessengerContacts(): Promise<MessengerContact[]> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return [
      ...userMocks.map((user) => ({ authId: user.authId || user.id, username: user.name, avatar: user.avatar ?? null })),
      ...getMockConnections(),
    ];
  }
  return httpJson<MessengerContact[]>(`${import.meta.env.VITE_API_CORE}/api/connections`, {
    service: "user",
    operation: "getMessengerContacts",
    errorMessage: i18n.t("chat:contactsError"),
  });
}

/** Adiciona uma pessoa às conexões (`POST /api/connections`, com o id do usuário a conectar). */
export async function addConnection(contact: { userId: string; username: string; avatar?: string | null }): Promise<void> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    addMockConnection({ authId: contact.userId, username: contact.username, avatar: contact.avatar ?? null });
    return;
  }
  await httpJson<unknown>(`${import.meta.env.VITE_API_CORE}/api/connections`, {
    service: "user",
    operation: "addConnection",
    method: "POST",
    body: { connectedUserId: contact.userId },
    errorMessage: i18n.t("chat:connectionError"),
  });
}

export async function getUserSummary(authId: string): Promise<{ username: string; avatar: string | null }> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    const user = userMocks.find((item) => item.id === authId || item.authId === authId) ?? userMocks[0];
    return { username: user.name, avatar: user.avatar ?? null };
  }
  return httpJson<{ username: string; avatar: string | null }>(
    `${import.meta.env.VITE_API_CORE}/api/users/auth/${encodeURIComponent(authId)}/summary`,
    {
      service: "user",
      operation: "getUserSummary",
      errorMessage: i18n.t("services:user.getUserSummary"),
    },
  );
}
