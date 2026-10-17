import { Client } from "@stomp/stompjs";

import type { MessageDto } from "./messages.messenger.api";
import { refresh } from "@/features/access/access.service";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import i18n from "@/config/i18n/internationalization";
import logger from "@/config/logging/logger";
import { createServiceError } from "@/config/logging/serviceError.utils";

interface MessageEvent {
  type: string;
  conversationId: string;
  payload: MessageDto;
}

export function subscribeToConversations(
  conversationIds: string[],
  onMessage: (message: MessageDto) => void,
  onConnectionChange?: (connected: boolean) => void,
): () => void {
  if (isAlwaysMockMode("MESSENGER")) {
    onConnectionChange?.(true);
    return () => undefined;
  }
  const brokerURL = import.meta.env.VITE_WS_MESSENGER;
  if (!getAuthSession() || !brokerURL) {
    onConnectionChange?.(false);
    return () => undefined;
  }

  const client = new Client({
    brokerURL,
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    beforeConnect: async () => {
      const stored = getAuthSession();
      if (!stored) throw createServiceError("messenger", "beforeConnect", i18n.t("services:messenger.sessionUnavailable"));
      const session = new Date(stored.accessTokenExpiresAt).getTime() - Date.now() > 60_000 ? stored : await refresh();
      if (!session) throw createServiceError("messenger", "beforeConnect", i18n.t("services:messenger.sessionUnavailable"));
      client.connectHeaders = { Authorization: `Bearer ${session.accessToken}` };
    },
    onConnect: () => {
      conversationIds.forEach((conversationId) => {
        client.subscribe(`/topic/conversations/${conversationId}`, (frame) => {
          try {
            const event = JSON.parse(frame.body) as MessageEvent;
            if (event.type === "MESSAGE_CREATED" && event.conversationId === conversationId) onMessage(event.payload);
          } catch (error) {
            logger.serviceError({ service: "messenger", operation: "parseMessageEvent", error });
            // Ignore frames with an unexpected payload; REST remains the source of truth.
          }
        });
      });
      onConnectionChange?.(true);
    },
    onWebSocketClose: () => onConnectionChange?.(false),
    onWebSocketError: () => {
      logger.serviceError({ service: "messenger", operation: "connect" });
      onConnectionChange?.(false);
    },
    onStompError: () => {
      logger.serviceError({ service: "messenger", operation: "subscribeToConversations" });
      onConnectionChange?.(false);
    },
  });
  client.activate();
  return () => {
    void client.deactivate();
  };
}

export function subscribeToConversation(
  conversationId: string,
  onMessage: (message: MessageDto) => void,
  onConnectionChange?: (connected: boolean) => void,
): () => void {
  return subscribeToConversations([conversationId], onMessage, onConnectionChange);
}
