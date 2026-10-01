import { httpJson } from "@/shared/http/http.service";
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
    errorMessage: "Não foi possível carregar as conversas",
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
    errorMessage: "Não foi possível carregar a conversa",
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
    errorMessage: "Não foi possível iniciar a conversa",
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
    errorMessage: "Não foi possível carregar as mensagens",
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
    errorMessage: "Não foi possível sincronizar as mensagens",
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
    errorMessage: "Não foi possível atualizar a leitura da conversa",
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
    errorMessage: "Não foi possível enviar a mensagem",
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
      errorMessage: "Não foi possível carregar o participante",
    },
  );
}
