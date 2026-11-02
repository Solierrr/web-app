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
  getMockMessageUpdates,
  mutateMockMessage,
  updateMockConversationState,
  getMockConnections,
  addMockConnection,
} from "./messages.messenger.d.mocks";
import { announceMockPresence } from "./messages.messenger.realtime.d.mocks";
import { userMocks } from "@/config/mocks/registry";

const API = `${import.meta.env.VITE_API_MESSENGER?.replace(/\/$/, "")}/messaging`;

export interface ConversationDto {
  id: string;
  conversationType: "DIRECT" | "GROUP" | "CHAT_BOT";
  participantIds: string[];
  title: string | null;
  lastInteractionAt: string | null;
  unreadCount?: number;
  lastReadSequence?: number | null;
  syncEpoch?: string;
  syncVersion?: number;
  communityId?: string | null;
  communityStatus?: "ACTIVE" | "ARCHIVED" | null;
  managerUserId?: string | null;
  /** Estado pessoal: vale só para quem pediu e vem no item da lista. */
  muted?: boolean;
  archived?: boolean;
  effectiveMuted?: boolean;
}

export interface RejectedParticipant {
  userId: string;
  reasonCode: string;
}

export interface ConversationStateDto {
  conversationId: string;
  syncEpoch: string;
  syncVersion: number;
  lastReadSequence: number;
  unreadCount: number;
  muted: boolean;
  archived: boolean;
  effectiveMuted: boolean;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  sequence: number;
  clientMessageId?: string | null;
  role?: string;
  messageType?: "USER_TO_USER" | "USER_TO_GROUP" | "USER_TO_CHATBOT" | "CHATBOT_TO_USER";
  edited?: boolean;
  deleted?: boolean;
  /** Versão da última mudança da mensagem: entre duas cópias do mesmo id vale a de maior valor. */
  changeVersion?: number;
}

export interface MessageUpdatesDto {
  syncEpoch: string;
  cursor: number;
  hasMore: boolean;
  messages: MessageDto[];
}

export const MESSAGE_PAGE_SIZE = 100;

export async function getConversations(archived = false): Promise<ConversationDto[]> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return getMockMessenger().conversations.filter((item) => !!item.archived === archived);
  }
  return httpJson<ConversationDto[]>(`${API}/conversations/me${archived ? "?archived=true" : ""}`, {
    service: "messenger",
    operation: "getConversations",
    errorMessage: i18n.t("services:messenger.getConversations"),
  });
}

export async function getConversation(id: string): Promise<ConversationDto> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    const conversation = getMockConversation(id);
    announceMockPresence(conversation);
    return conversation;
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
      .slice(-MESSAGE_PAGE_SIZE);
  }
  const cursor = beforeSequence === undefined ? "" : `&beforeSequence=${beforeSequence}`;
  return httpJson<MessageDto[]>(`${API}/messages/conversation/${encodeURIComponent(id)}?limit=${MESSAGE_PAGE_SIZE}${cursor}`, {
    service: "messenger",
    operation: "getConversationMessages",
    errorMessage: i18n.t("services:messenger.getConversationMessages"),
  });
}

export async function getConversationMessagesSince(id: string, sequence: number): Promise<MessageDto[]> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return getMockMessenger().messages.filter((item) => item.conversationId === id && item.sequence > sequence);
  }
  return httpJson<MessageDto[]>(`${API}/messages/conversation/${encodeURIComponent(id)}?sinceSequence=${sequence}&limit=${MESSAGE_PAGE_SIZE}`, {
    service: "messenger",
    operation: "syncConversationMessages",
    errorMessage: i18n.t("services:messenger.syncConversationMessages"),
  });
}

export async function markConversationRead(id: string, sequence: number, conversationType?: ConversationDto["conversationType"]): Promise<void> {
  if (conversationType === "CHAT_BOT" || sequence < 1) return;
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    markMockConversationRead(id);
    return;
  }
  await httpJson<unknown>(`${API}/conversations/${encodeURIComponent(id)}/state`, {
    service: "messenger",
    operation: "markConversationRead",
    method: "PATCH",
    body: { lastReadSequence: sequence },
    errorMessage: i18n.t("services:messenger.markConversationRead"),
  });
}

export async function sendConversationMessage(
  conversationId: string,
  content: string,
  conversationType: ConversationDto["conversationType"] = "DIRECT",
  clientMessageId?: string,
): Promise<MessageDto> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return sendMockMessage(conversationId, content, clientMessageId);
  }
  return httpJson<MessageDto>(`${API}/messages`, {
    service: "messenger",
    operation: "sendConversationMessage",
    method: "POST",
    body: {
      conversationId,
      ...(clientMessageId ? { clientMessageId } : {}),
      messageType: conversationType === "GROUP" ? "USER_TO_GROUP" : conversationType === "CHAT_BOT" ? "USER_TO_CHATBOT" : "USER_TO_USER",
      content,
    },
    errorMessage: i18n.t("services:messenger.sendConversationMessage"),
  });
}

/** Silencia ou arquiva a conversa só para o próprio usuário (`PATCH /state`, campo ausente = inalterado). */
export async function updateConversationState(id: string, patch: { muted?: boolean; archived?: boolean }): Promise<ConversationStateDto> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return updateMockConversationState(id, patch);
  }
  return httpJson<ConversationStateDto>(`${API}/conversations/${encodeURIComponent(id)}/state`, {
    service: "messenger",
    operation: "updateConversationState",
    method: "PATCH",
    body: patch,
    errorMessage: i18n.t("services:messenger.updateConversationState"),
  });
}

/** Catch-up: sem `since` devolve só o ponto de partida; com `since`, o estado atual das mensagens que mudaram depois dele. */
export async function getMessageUpdates(since?: number): Promise<MessageUpdatesDto> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return getMockMessageUpdates(since);
  }
  return httpJson<MessageUpdatesDto>(`${API}/updates${since === undefined ? "" : `?since=${since}&limit=${MESSAGE_PAGE_SIZE}`}`, {
    service: "messenger",
    operation: "getMessageUpdates",
    errorMessage: i18n.t("services:messenger.getMessageUpdates"),
  });
}

export async function editMessage(id: string, content: string): Promise<MessageDto> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return mutateMockMessage(id, "edited", content);
  }
  return httpJson<MessageDto>(`${API}/messages/${encodeURIComponent(id)}`, {
    service: "messenger",
    operation: "editMessage",
    method: "PATCH",
    body: { content },
    errorMessage: i18n.t("services:messenger.editMessage"),
  });
}

export async function deleteMessage(id: string): Promise<MessageDto> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return mutateMockMessage(id, "deleted");
  }
  return httpJson<MessageDto>(`${API}/messages/${encodeURIComponent(id)}`, {
    service: "messenger",
    operation: "deleteMessage",
    method: "DELETE",
    errorMessage: i18n.t("services:messenger.deleteMessage"),
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
