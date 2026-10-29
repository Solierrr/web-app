import type { ConversationDto, MessageDto } from "./messages.messenger.api";

export type ConnectionStatus = "idle" | "connecting" | "connected" | "reconnecting" | "unavailable";

export interface ConnectionState {
  status: ConnectionStatus;
  attempts: number;
}

export interface RealtimeEnvelope {
  type?: string;
  conversationId?: string;
  eventId?: string;
  serverTimestamp?: string;
  payload?: unknown;
}

export interface PresenceMarker {
  epoch?: string;
  version?: number;
}

export type ConversationEvent =
  | { kind: "message"; change: "created" | "edited" | "deleted"; message: MessageDto }
  | { kind: "typing"; userId: string; typing: boolean }
  | ({ kind: "presence"; userId: string; online: boolean } & PresenceMarker)
  | ({ kind: "presenceSnapshot"; users: Record<string, boolean> } & PresenceMarker);

export type UserEvent = { kind: "conversationUpdated"; conversation: ConversationDto } | { kind: "conversationRemoved"; id: string };

export type ConversationListener = (event: ConversationEvent) => void;
export type UserListener = (event: UserEvent) => void;
