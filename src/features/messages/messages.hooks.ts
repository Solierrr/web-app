import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { AgentChatError } from "@/features/error/agent-chat/AgentChat.error";
import { sendConversationMessage, type ConversationDto, type MessageDto } from "./messages.messenger.api";
import type { ConnectionState } from "./messages.messenger.realtime";
import { applyPresence, EMPTY_PRESENCE, type PresenceState } from "./messages.messenger.realtime.utils";
import { getConnectionState, publishTyping, subscribeToConnection, subscribeToConversation } from "./messages.messenger.socket";

const TYPING_EXPIRES_MS = 6_000;
const TYPING_REPEAT_MS = 3_000;
const TYPING_IDLE_MS = 4_000;
export const ASSISTANT_TIMEOUT_MS = 45_000;

export interface PendingMessage {
  clientMessageId: string;
  content: string;
  status: "sending" | "failed";
  createdAt: string;
  reason?: string;
}

export type OutboxTransport = (content: string) => Promise<MessageDto | null>;

export function useMessengerConnection(): ConnectionState {
  return useSyncExternalStore(subscribeToConnection, getConnectionState, getConnectionState);
}

export function useConversationPresence(conversationId: string): { typing: string[]; presence: PresenceState } {
  const [typing, setTyping] = useState<string[]>([]);
  const [presence, setPresence] = useState<PresenceState>(EMPTY_PRESENCE);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const active = timers.current;
    const stopTyping = (userId: string) => {
      clearTimeout(active.get(userId));
      active.delete(userId);
      setTyping((current) => current.filter((item) => item !== userId));
    };
    const unsubscribe = subscribeToConversation(conversationId, (event) => {
      if (event.kind === "typing") {
        if (!event.typing) return stopTyping(event.userId);
        clearTimeout(active.get(event.userId));
        active.set(
          event.userId,
          setTimeout(() => stopTyping(event.userId), TYPING_EXPIRES_MS),
        );
        setTyping((current) => (current.includes(event.userId) ? current : [...current, event.userId]));
      } else if (event.kind === "presence" || event.kind === "presenceSnapshot") {
        setPresence((current) => applyPresence(current, event));
      } else if (event.change === "created") {
        stopTyping(event.message.senderId.toLowerCase());
      }
    });
    return () => {
      unsubscribe();
      active.forEach((timer) => clearTimeout(timer));
      active.clear();
    };
  }, [conversationId]);

  return { typing, presence };
}

export function useTypingPublisher(conversationId: string, enabled: boolean): { notify: (draft: string) => void; stop: () => void } {
  const lastSent = useRef(0);
  const idle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const stop = useCallback(() => {
    clearTimeout(idle.current);
    if (!lastSent.current) return;
    lastSent.current = 0;
    publishTyping(conversationId, false);
  }, [conversationId]);

  const notify = useCallback(
    (draft: string) => {
      if (!enabled) return;
      if (!draft.trim()) return stop();
      const now = Date.now();
      if (now - lastSent.current > TYPING_REPEAT_MS) {
        lastSent.current = now;
        publishTyping(conversationId, true);
      }
      clearTimeout(idle.current);
      idle.current = setTimeout(stop, TYPING_IDLE_MS);
    },
    [conversationId, enabled, stop],
  );

  useEffect(() => stop, [stop]);

  return { notify, stop };
}

export function useOutbox(
  conversationId: string,
  conversationType: ConversationDto["conversationType"] | undefined,
  onDelivered: (message: MessageDto) => void,
  transport?: OutboxTransport,
): {
  pending: PendingMessage[];
  send: (content: string) => void;
  retry: (clientMessageId: string) => void;
  discard: (clientMessageId: string) => string | undefined;
  acknowledge: (clientMessageId: string) => void;
} {
  const [pending, setPending] = useState<PendingMessage[]>([]);
  const items = useRef<PendingMessage[]>([]);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const alive = useRef(false);
  const delivered = useRef(onDelivered);
  const customTransport = useRef(transport);

  useEffect(() => {
    delivered.current = onDelivered;
    customTransport.current = transport;
  });

  const update = useCallback((next: PendingMessage[]) => {
    items.current = next;
    setPending(next);
  }, []);

  const attempt = useCallback(
    (item: PendingMessage) => {
      queue.current = queue.current.then(async () => {
        if (!alive.current || !items.current.some((entry) => entry.clientMessageId === item.clientMessageId)) return;
        update(items.current.map((entry) => (entry.clientMessageId === item.clientMessageId ? { ...entry, status: "sending" } : entry)));
        try {
          const sent = customTransport.current
            ? await customTransport.current(item.content)
            : await sendConversationMessage(conversationId, item.content, conversationType, item.clientMessageId);
          if (!alive.current) return;
          update(items.current.filter((entry) => entry.clientMessageId !== item.clientMessageId));
          if (sent) delivered.current(sent);
        } catch (error) {
          const reason = error instanceof AgentChatError ? error.message : undefined;
          if (alive.current)
            update(items.current.map((entry) => (entry.clientMessageId === item.clientMessageId ? { ...entry, status: "failed", reason } : entry)));
        }
      });
    },
    [conversationId, conversationType, update],
  );

  const send = useCallback(
    (content: string) => {
      const item: PendingMessage = { clientMessageId: crypto.randomUUID(), content, status: "sending", createdAt: new Date().toISOString() };
      update([...items.current, item]);
      attempt(item);
    },
    [attempt, update],
  );

  const retry = useCallback(
    (clientMessageId: string) => {
      const item = items.current.find((entry) => entry.clientMessageId === clientMessageId && entry.status === "failed");
      if (item) attempt(item);
    },
    [attempt],
  );

  const discard = useCallback(
    (clientMessageId: string) => {
      const item = items.current.find((entry) => entry.clientMessageId === clientMessageId);
      update(items.current.filter((entry) => entry.clientMessageId !== clientMessageId));
      return item?.content;
    },
    [update],
  );

  const acknowledge = useCallback(
    (clientMessageId: string) => {
      if (items.current.some((entry) => entry.clientMessageId === clientMessageId)) {
        update(items.current.filter((entry) => entry.clientMessageId !== clientMessageId));
      }
    },
    [update],
  );

  useEffect(() => {
    alive.current = true;
    const retryAll = () => items.current.filter((entry) => entry.status === "failed").forEach(attempt);
    window.addEventListener("online", retryAll);
    return () => {
      alive.current = false;
      window.removeEventListener("online", retryAll);
    };
  }, [attempt]);

  return { pending, send, retry, discard, acknowledge };
}

export function useAssistantStatus(
  enabled: boolean,
  messages: MessageDto[],
  userId: string | undefined,
  resync: () => Promise<void>,
): "idle" | "thinking" | "timeout" {
  const last = messages[messages.length - 1];
  const awaiting = enabled && !!last && last.senderId === userId && last.messageType !== "CHATBOT_TO_USER";
  const lastSequence = last?.sequence ?? 0;
  const [expired, setExpired] = useState(0);
  const refresh = useRef(resync);

  useEffect(() => {
    refresh.current = resync;
  });

  useEffect(() => {
    if (!awaiting) return;
    const timer = setTimeout(() => {
      void refresh
        .current()
        .catch(() => undefined)
        .finally(() => setExpired(lastSequence));
    }, ASSISTANT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [awaiting, lastSequence]);

  if (!awaiting) return "idle";
  return expired === lastSequence ? "timeout" : "thinking";
}
