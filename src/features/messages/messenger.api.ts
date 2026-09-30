import { httpJson } from "@/shared/http/http.service";

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

export function getConversations(): Promise<ConversationDto[]> {
  return httpJson<ConversationDto[]>(`${API}/conversations/me`, {
    service: "messenger",
    operation: "getConversations",
    errorMessage: "Não foi possível carregar as conversas",
  });
}

export function getConversation(id: string): Promise<ConversationDto> {
  return httpJson<ConversationDto>(`${API}/conversations/${encodeURIComponent(id)}`, {
    service: "messenger",
    operation: "getConversation",
    errorMessage: "Não foi possível carregar a conversa",
  });
}

export function createDirectConversation(recipientId: string): Promise<ConversationDto> {
  return httpJson<ConversationDto>(`${API}/conversations/direct`, {
    service: "messenger",
    operation: "createDirectConversation",
    method: "POST",
    body: { recipientId },
    errorMessage: "Não foi possível iniciar a conversa",
  });
}

export function getConversationMessages(id: string, beforeSequence?: number): Promise<MessageDto[]> {
  const params = new URLSearchParams({ limit: "100" });
  if (beforeSequence !== undefined) params.set("beforeSequence", String(beforeSequence));
  return httpJson<MessageDto[]>(`${API}/messages/conversation/${encodeURIComponent(id)}/history?${params}`, {
    service: "messenger",
    operation: "getConversationMessages",
    errorMessage: "Não foi possível carregar as mensagens",
  });
}

export function getConversationMessagesSince(id: string, sequence: number): Promise<MessageDto[]> {
  return httpJson<MessageDto[]>(`${API}/messages/conversation/${encodeURIComponent(id)}?sinceSequence=${sequence}&limit=100`, {
    service: "messenger",
    operation: "syncConversationMessages",
    errorMessage: "Não foi possível sincronizar as mensagens",
  });
}

export function markConversationRead(id: string, sequence: number): Promise<ConversationDto> {
  return httpJson<ConversationDto>(`${API}/conversations/${encodeURIComponent(id)}/read`, {
    service: "messenger",
    operation: "markConversationRead",
    method: "POST",
    body: { sequence },
    errorMessage: "Não foi possível atualizar a leitura da conversa",
  });
}

export function sendConversationMessage(conversationId: string, content: string): Promise<MessageDto> {
  return httpJson<MessageDto>(`${API}/messages`, {
    service: "messenger",
    operation: "sendConversationMessage",
    method: "POST",
    body: { conversationId, messageType: "USER_TO_USER", content },
    errorMessage: "Não foi possível enviar a mensagem",
  });
}

export function getUserSummary(authId: string): Promise<{ username: string; avatar: string | null }> {
  return httpJson<{ username: string; avatar: string | null }>(
    `${import.meta.env.VITE_API_CORE}/api/users/auth/${encodeURIComponent(authId)}/summary`,
    {
      service: "user",
      operation: "getUserSummary",
      errorMessage: "Não foi possível carregar o participante",
    },
  );
}
