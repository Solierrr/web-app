import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import type { ConversationDto, MessageDto } from "./messages.messenger.api";

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
