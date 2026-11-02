import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { HttpResponseError } from "@/lib/shared/http/http.service";
import { MESSAGE_MUTATION_WINDOW_MS } from "./messages.messenger.realtime.utils";
import type { ConversationDto, ConversationStateDto, MessageDto, MessageUpdatesDto } from "./messages.messenger.api";
import { publishMockConversation, publishMockMessage, simulateMockReplies, type MockReply } from "./messages.messenger.realtime.d.mocks";

interface MockMessenger {
  conversations: ConversationDto[];
  messages: MessageDto[];
}

function key(): string {
  return `solaria.mock.messenger.${getAuthSession()?.userId ?? "anonymous"}`;
}

const DEMO_CONVERSATIONS: [days: number, title: string][] = [
  [0, "Comparar placas monocristalinas e policristalinas"],
  [0, "Qual potência preciso para uma casa de 4 pessoas?"],
  [1, "Estruturas para telhado de fibrocimento"],
  [1, "Prazo de instalação em Campinas"],
  [2, "Como funciona o sistema on-grid?"],
  [4, "Manutenção preventiva do inversor"],
  [6, "Orçamento para ampliar a usina da loja"],
  [9, "Diferença entre eficiência e potência nominal"],
  [16, "Fornecedores com equipe técnica própria"],
  [24, "Financiamento para energia solar comercial"],
  [41, "Dimensionamento para galpão de 800 m²"],
  [58, "Garantia das placas e dos inversores"],
];

/** Conversas de exemplo com o assistente, só na primeira abertura dos dados simulados, para a lista aparecer cheia. */
function demoMessenger(): MockMessenger {
  const userId = getAuthSession()?.userId ?? "mock-user";
  const conversations: ConversationDto[] = [];
  const messages: MessageDto[] = [];
  DEMO_CONVERSATIONS.forEach(([days, title], index) => {
    const id = `demo-${index}`;
    const time = new Date(Date.now() - days * 86_400_000 - index * 3_600_000).toISOString();
    conversations.push({ id, conversationType: "CHAT_BOT", participantIds: [userId], title, lastInteractionAt: time, unreadCount: 0 });
    messages.push(
      {
        id: `${id}-1`,
        conversationId: id,
        senderId: userId,
        content: title,
        timestamp: time,
        sequence: 1,
        role: "user",
        messageType: "USER_TO_CHATBOT",
      },
      {
        id: `${id}-2`,
        conversationId: id,
        senderId: "assistant",
        content: "Posso ajudar com isso. Me conte um pouco mais sobre o seu caso.",
        timestamp: time,
        sequence: 2,
        role: "assistant",
        messageType: "CHATBOT_TO_USER",
      },
    );
  });
  return { conversations, messages };
}

/** Erro no mesmo formato do `httpJson`, para a interface tratar o modo demonstração como o servidor real. */
export function mockHttpError(status: number, code: string): Error {
  return new Error(`mock returned HTTP ${status}`, { cause: new HttpResponseError(status, code) });
}

export function getMockMessenger(): MockMessenger {
  try {
    return JSON.parse(localStorage.getItem(key()) ?? "null") ?? demoMessenger();
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

export function sendMockMessage(conversationId: string, content: string, clientMessageId?: string): MessageDto {
  const state = getMockMessenger();
  const sequence = Math.max(0, ...state.messages.filter((item) => item.conversationId === conversationId).map((item) => item.sequence)) + 1;
  const message: MessageDto = {
    id: crypto.randomUUID(),
    conversationId,
    senderId: getAuthSession()?.userId ?? "mock-user",
    content,
    timestamp: new Date().toISOString(),
    sequence,
    clientMessageId: clientMessageId ?? null,
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
  publishMockMessage(message);
  publishMockConversation({ ...conversation, unreadCount: 0 });
  simulateMockReplies(conversation, receiveMockMessage);
  return message;
}

/** Stores a message written by someone else and announces it through the same realtime path as the real broker. */
export function receiveMockMessage(conversationId: string, reply: MockReply): MessageDto {
  const state = getMockMessenger();
  const sequence = Math.max(0, ...state.messages.filter((item) => item.conversationId === conversationId).map((item) => item.sequence)) + 1;
  const message: MessageDto = { id: crypto.randomUUID(), conversationId, timestamp: new Date().toISOString(), sequence, ...reply };
  const conversation = {
    ...getMockConversation(conversationId),
    lastInteractionAt: message.timestamp,
    unreadCount: (getMockConversation(conversationId).unreadCount ?? 0) + 1,
  };
  localStorage.setItem(
    key(),
    JSON.stringify({
      conversations: [...state.conversations.filter((item) => item.id !== conversationId), conversation],
      messages: [...state.messages, message],
    }),
  );
  window.dispatchEvent(new Event("solaria:messenger"));
  publishMockMessage(message);
  publishMockConversation(conversation);
  return message;
}

/** Edita ou apaga a própria mensagem dentro da janela de 30 min, como o servidor, e avisa pelo mesmo caminho ao vivo. */
export function mutateMockMessage(id: string, change: "edited" | "deleted", content = ""): MessageDto {
  const state = getMockMessenger();
  const current = state.messages.find((item) => item.id === id);
  if (!current) throw mockHttpError(404, "RESOURCE_NOT_FOUND");
  if (current.senderId !== (getAuthSession()?.userId ?? "mock-user")) throw mockHttpError(403, "UNAUTHORIZED_ACCESS");
  if (current.deleted && change === "deleted") return current;
  if (current.deleted || Date.now() - Date.parse(current.timestamp) >= MESSAGE_MUTATION_WINDOW_MS)
    throw mockHttpError(422, "BUSINESS_RULE_VIOLATION");
  const changeVersion = Math.max(0, ...state.messages.map((item) => item.changeVersion ?? 0)) + 1;
  const message: MessageDto = { ...current, ...(change === "edited" ? { content, edited: true } : { content: "", deleted: true }), changeVersion };
  localStorage.setItem(key(), JSON.stringify({ ...state, messages: state.messages.map((item) => (item.id === id ? message : item)) }));
  window.dispatchEvent(new Event("solaria:messenger"));
  publishMockMessage(message, change);
  return message;
}

/** Catch-up simulado: o relógio é o maior `changeVersion` guardado; sem `since` só devolve o ponto de partida. */
export function getMockMessageUpdates(since?: number): MessageUpdatesDto {
  const messages = getMockMessenger().messages;
  const cursor = Math.max(0, ...messages.map((item) => item.changeVersion ?? 0));
  if (since === undefined) return { syncEpoch: "mock", cursor, hasMore: false, messages: [] };
  return {
    syncEpoch: "mock",
    cursor: Math.max(cursor, since),
    hasMore: false,
    messages: messages.filter((item) => (item.changeVersion ?? 0) > since),
  };
}

/** Silencia/arquiva só para o usuário; a conversa com o assistente não aceita (422, como no servidor). */
export function updateMockConversationState(id: string, patch: { muted?: boolean; archived?: boolean }): ConversationStateDto {
  const state = getMockMessenger();
  const current = getMockConversation(id);
  if (current.conversationType === "CHAT_BOT") throw mockHttpError(422, "BUSINESS_RULE_VIOLATION");
  const muted = patch.muted ?? current.muted ?? false;
  const archived = patch.archived ?? current.archived ?? false;
  const next: ConversationDto = { ...current, muted, archived, effectiveMuted: muted || archived };
  localStorage.setItem(key(), JSON.stringify({ ...state, conversations: [...state.conversations.filter((item) => item.id !== id), next] }));
  window.dispatchEvent(new Event("solaria:messenger"));
  publishMockConversation(next);
  return {
    conversationId: id,
    syncEpoch: "mock",
    syncVersion: 0,
    lastReadSequence: next.lastReadSequence ?? 0,
    unreadCount: next.unreadCount ?? 0,
    muted,
    archived,
    effectiveMuted: muted || archived,
  };
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
    publishMockConversation(conversation);
  }
  return conversation;
}

/** Registers a project group in the same local messenger store used by Conversation. */
export function saveMockProjectConversation(conversation: ConversationDto): ConversationDto {
  const s = getMockMessenger();
  const existing = s.conversations.find((c) => c.id === conversation.id);
  if (existing) return existing;
  localStorage.setItem(key(), JSON.stringify({ ...s, conversations: [...s.conversations, conversation] }));
  window.dispatchEvent(new Event("solaria:messenger"));
  return conversation;
}

function connectionsKey(): string {
  return `solaria.mock.connections.${getAuthSession()?.userId ?? "anonymous"}`;
}

export function getMockConnections(): { authId: string; username: string; avatar: string | null }[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(connectionsKey()) ?? "[]");
    return Array.isArray(value) ? (value as { authId: string; username: string; avatar: string | null }[]) : [];
  } catch {
    return [];
  }
}

export function addMockConnection(contact: { authId: string; username: string; avatar: string | null }): void {
  const current = getMockConnections();
  if (current.some((item) => item.authId === contact.authId)) return;
  localStorage.setItem(connectionsKey(), JSON.stringify([...current, contact]));
  window.dispatchEvent(new Event("solaria:messenger"));
}
