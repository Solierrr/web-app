import type { ConversationDto, MessageDto } from "./messages.messenger.api";
import type { ConversationEvent, PresenceMarker, RealtimeEnvelope, UserEvent } from "./messages.messenger.realtime";

export type UserTopicKind = "acks" | "errors" | "conversations";

export function conversationTopic(conversationId: string): string {
  return `/topic/conversations.${conversationId}`;
}

export function userTopic(userId: string, kind: UserTopicKind): string {
  return `/topic/users.${userId.toLowerCase()}.${kind}`;
}

export function classifyDestination(destination: string): { scope: "conversation"; id: string } | { scope: "user"; kind: UserTopicKind } | null {
  const conversation = /^\/topic\/conversations\.([A-Za-z0-9_-]+)$/.exec(destination);
  if (conversation) return { scope: "conversation", id: conversation[1] };
  const user = /^\/topic\/users\.[A-Za-z0-9_-]{1,64}\.(acks|errors|conversations)$/.exec(destination);
  if (user) return { scope: "user", kind: user[1] as UserTopicKind };
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toEnvelope(body: unknown): RealtimeEnvelope | null {
  return isRecord(body) && typeof body.type === "string" ? (body as RealtimeEnvelope) : null;
}

export function toMessageDto(value: unknown): MessageDto | null {
  if (!isRecord(value)) return null;
  const { id, conversationId, senderId, content, timestamp, sequence } = value;
  if (typeof id !== "string" || typeof conversationId !== "string" || typeof sequence !== "number") return null;
  return {
    ...(value as unknown as MessageDto),
    id,
    conversationId,
    senderId: typeof senderId === "string" ? senderId : "",
    content: typeof content === "string" ? content : "",
    timestamp: typeof timestamp === "string" ? timestamp : new Date().toISOString(),
    sequence,
  };
}

export function toConversationDto(value: unknown): ConversationDto | null {
  if (!isRecord(value) || typeof value.id !== "string") return null;
  const lastInteractionAt = typeof value.lastInteractionAt === "string" ? value.lastInteractionAt : null;
  const lastMessage = isRecord(value.lastMessage) && typeof value.lastMessage.timestamp === "string" ? value.lastMessage.timestamp : null;
  return {
    id: value.id,
    conversationType: value.conversationType as ConversationDto["conversationType"],
    participantIds: Array.isArray(value.participantIds) ? value.participantIds.filter((item): item is string => typeof item === "string") : [],
    title: typeof value.title === "string" ? value.title : null,
    lastInteractionAt: lastInteractionAt ?? lastMessage,
    unreadCount: typeof value.unreadCount === "number" ? value.unreadCount : 0,
    lastReadSequence: typeof value.lastReadSequence === "number" ? value.lastReadSequence : null,
    syncEpoch: typeof value.syncEpoch === "string" ? value.syncEpoch : undefined,
    syncVersion: typeof value.syncVersion === "number" ? value.syncVersion : undefined,
    communityId: typeof value.communityId === "string" ? value.communityId : null,
  };
}

function presenceMarker(payload: Record<string, unknown>): PresenceMarker {
  return {
    epoch: typeof payload.presenceEpoch === "string" ? payload.presenceEpoch : undefined,
    version: typeof payload.presenceVersion === "number" ? payload.presenceVersion : undefined,
  };
}

export function parseConversationFrame(body: unknown): ConversationEvent | null {
  const envelope = toEnvelope(body);
  if (!envelope) return null;
  const payload = isRecord(envelope.payload) ? envelope.payload : {};
  switch (envelope.type) {
    case "MESSAGE_CREATED":
    case "MESSAGE_EDITED":
    case "MESSAGE_DELETED": {
      const message = toMessageDto(envelope.payload);
      if (!message) return null;
      const change = envelope.type === "MESSAGE_CREATED" ? "created" : envelope.type === "MESSAGE_EDITED" ? "edited" : "deleted";
      return { kind: "message", change, message };
    }
    case "TYPING_STARTED":
    case "TYPING_STOPPED":
      return typeof payload.userId === "string"
        ? { kind: "typing", userId: payload.userId.toLowerCase(), typing: envelope.type === "TYPING_STARTED" }
        : null;
    case "USER_ONLINE":
    case "USER_OFFLINE":
      return typeof payload.userId === "string"
        ? { kind: "presence", userId: payload.userId.toLowerCase(), online: envelope.type === "USER_ONLINE", ...presenceMarker(payload) }
        : null;
    case "PRESENCE_SNAPSHOT": {
      const users: Record<string, boolean> = {};
      if (isRecord(payload.users)) {
        for (const [userId, online] of Object.entries(payload.users)) users[userId.toLowerCase()] = online === true;
      }
      return { kind: "presenceSnapshot", users, ...presenceMarker(payload) };
    }
    default:
      return null;
  }
}

export function parseUserFrame(body: unknown): UserEvent | null {
  const envelope = toEnvelope(body);
  if (!envelope) return null;
  if (envelope.type === "CONVERSATION_UPDATED") {
    const conversation = toConversationDto(envelope.payload);
    return conversation ? { kind: "conversationUpdated", conversation } : null;
  }
  if (envelope.type === "CONVERSATION_REMOVED") {
    return isRecord(envelope.payload) && typeof envelope.payload.id === "string" ? { kind: "conversationRemoved", id: envelope.payload.id } : null;
  }
  return null;
}

/** Junta mensagens pelo id e ordena por sequência: o histórico REST e os eventos ao vivo nunca duplicam a mesma mensagem. */
export function mergeMessages(current: MessageDto[], incoming: MessageDto[]): MessageDto[] {
  return [...new Map([...current, ...incoming].map((message) => [message.id, message])).values()].sort(
    (left, right) => left.sequence - right.sequence,
  );
}

export function highestSequence(messages: MessageDto[], floor = 0): number {
  return messages.reduce((highest, message) => Math.max(highest, message.sequence), floor);
}

function isStale(existing: ConversationDto, incoming: ConversationDto): boolean {
  return (
    existing.syncEpoch !== undefined &&
    existing.syncEpoch === incoming.syncEpoch &&
    existing.syncVersion !== undefined &&
    incoming.syncVersion !== undefined &&
    incoming.syncVersion < existing.syncVersion
  );
}

/** Aplica uma atualização de conversa da lista; ignora versões mais antigas que a já conhecida na mesma época. */
export function mergeConversation(list: ConversationDto[], incoming: ConversationDto): ConversationDto[] {
  const existing = list.find((item) => item.id === incoming.id);
  if (!existing) return [...list, incoming];
  if (isStale(existing, incoming)) return list;
  return list.map((item) => (item.id === incoming.id ? { ...item, ...incoming } : item));
}

export function removeConversation(list: ConversationDto[], id: string): ConversationDto[] {
  return list.filter((item) => item.id !== id);
}

export interface PresenceState {
  users: Record<string, boolean>;
  markers: Record<string, PresenceMarker>;
}

export const EMPTY_PRESENCE: PresenceState = { users: {}, markers: {} };

/** Aplica presença ao vivo ou o snapshot inicial, descartando eventos mais velhos que o último visto do mesmo usuário e época. */
export function applyPresence(state: PresenceState, event: Extract<ConversationEvent, { kind: "presence" | "presenceSnapshot" }>): PresenceState {
  const marker: PresenceMarker = { epoch: event.epoch, version: event.version };
  if (event.kind === "presenceSnapshot") {
    return { users: { ...event.users }, markers: Object.fromEntries(Object.keys(event.users).map((userId) => [userId, marker])) };
  }
  const known = state.markers[event.userId];
  if (known && known.epoch === marker.epoch && known.version !== undefined && marker.version !== undefined && marker.version <= known.version) {
    return state;
  }
  return { users: { ...state.users, [event.userId]: event.online }, markers: { ...state.markers, [event.userId]: marker } };
}
