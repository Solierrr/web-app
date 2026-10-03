import i18n from "@/config/i18n/internationalization";
import { httpJson } from "@/lib/shared/http/http.service";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import { getMockMessenger, getMockConversation, createMockConversation, sendMockMessage } from "./messages.messenger.d.mocks";
import { userMocks } from "@/config/mocks/registry";

const API = `${import.meta.env.VITE_API_MESSENGER}/messaging`;

export interface ConversationDto {
  id: string;
  conversationType: "DIRECT" | "GROUP" | "CHAT_BOT";
  participantIds: string[];
  title: string | null;
  lastInteractionAt: string | null;
  unreadCount: number;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  sequence: number;
}

export async function getConversations(): Promise<ConversationDto[]> {
  if (isAlwaysMockMode()) {
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
  if (isAlwaysMockMode()) {
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
  if (isAlwaysMockMode()) {
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
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return getMockMessenger()
      .messages.filter((item) => item.conversationId === id && (beforeSequence === undefined || item.sequence < beforeSequence))
      .slice(-100);
  }
  const params = new URLSearchParams({ limit: "100" });
  if (beforeSequence !== undefined) params.set("beforeSequence", String(beforeSequence));
  return httpJson<MessageDto[]>(`${API}/messages/conversation/${encodeURIComponent(id)}/history?${params}`, {
    service: "messenger",
    operation: "getConversationMessages",
    errorMessage: i18n.t("services:messenger.getConversationMessages"),
  });
}

export async function getConversationMessagesSince(id: string, sequence: number): Promise<MessageDto[]> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return getMockMessenger().messages.filter((item) => item.conversationId === id && item.sequence > sequence);
  }
  return httpJson<MessageDto[]>(`${API}/messages/conversation/${encodeURIComponent(id)}?sinceSequence=${sequence}&limit=100`, {
    service: "messenger",
    operation: "syncConversationMessages",
    errorMessage: i18n.t("services:messenger.syncConversationMessages"),
  });
}

export async function markConversationRead(id: string, sequence: number): Promise<ConversationDto> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return { ...getMockConversation(id), unreadCount: 0 };
  }
  return httpJson<ConversationDto>(`${API}/conversations/${encodeURIComponent(id)}/read`, {
    service: "messenger",
    operation: "markConversationRead",
    method: "POST",
    body: { sequence },
    errorMessage: i18n.t("services:messenger.markConversationRead"),
  });
}

export async function sendConversationMessage(conversationId: string, content: string): Promise<MessageDto> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return sendMockMessage(conversationId, content);
  }
  return httpJson<MessageDto>(`${API}/messages`, {
    service: "messenger",
    operation: "sendConversationMessage",
    method: "POST",
    body: { conversationId, messageType: "USER_TO_USER", content },
    errorMessage: i18n.t("services:messenger.sendConversationMessage"),
  });
}

export async function getUserSummary(authId: string): Promise<{ username: string; avatar: string | null }> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    const user = userMocks.find((item) => item.id === authId) ?? userMocks[0];
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
