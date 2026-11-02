import { Client, ReconnectionTimeMode, type IFrame, type StompSubscription } from "@stomp/stompjs";

import type { AuthSession } from "@/features/access/access";
import { refresh } from "@/features/access/access.service";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import logger from "@/config/logging/logger";
import { getMessageUpdates, type MessageDto } from "./messages.messenger.api";
import type { ConnectionState, ConversationListener, UserListener } from "./messages.messenger.realtime";
import {
  applyPresence,
  classifyDestination,
  EMPTY_PRESENCE,
  frameConversationId,
  parseConversationFrame,
  parseUserFrame,
  presenceEvents,
  userTopic,
} from "./messages.messenger.realtime.utils";

const HEARTBEAT_MS = 10_000;
const INITIAL_RECONNECT_MS = 1_000;
const MAX_RECONNECT_MS = 30_000;
const CONNECTION_TIMEOUT_MS = 30_000;
const PING_MS = 30_000;
const IDLE_DISCONNECT_MS = 10_000;
const TOKEN_MARGIN_MS = 60_000;
const MAX_TIMER_MS = 2_147_483_647;

const conversationListeners = new Map<string, Set<ConversationListener>>();
const userListeners = new Set<UserListener>();
const connectionListeners = new Set<() => void>();
const stompSubscriptions = new Map<string, StompSubscription>();

// Ponto do catch-up (`GET /updates`): fica na memória da aba e só some quando a sessão acaba ou muda de pessoa.
let catchUpState: { userId: string; epoch: string; cursor: number } | null = null;

// Presença é por pessoa e o snapshot só chega ao assinar: guardamos o que já chegou para quem começa a ouvir depois.
let presence = EMPTY_PRESENCE;

let client: Client | null = null;
let clientUserId: string | null = null;
let state: ConnectionState = { status: "idle", attempts: 0 };
let refreshBeforeConnect = false;
let idleTimer: ReturnType<typeof setTimeout> | undefined;
let pingTimer: ReturnType<typeof setInterval> | undefined;
let renewTimer: ReturnType<typeof setTimeout> | undefined;

function setState(next: ConnectionState) {
  if (next.status === state.status && next.attempts === state.attempts) return;
  state = next;
  connectionListeners.forEach((listener) => listener());
}

function hasListeners(): boolean {
  return conversationListeners.size > 0 || userListeners.size > 0;
}

function clearConnectionTimers() {
  clearInterval(pingTimer);
  clearTimeout(renewTimer);
  pingTimer = undefined;
  renewTimer = undefined;
}

function notify<T>(listeners: Iterable<(event: T) => void>, event: T) {
  for (const listener of [...listeners]) {
    try {
      listener(event);
    } catch (error) {
      logger.serviceError({ service: "messenger", operation: "dispatchEvent", error });
    }
  }
}

/** Um único canal `.events` leva tudo; aqui cada evento é entregue a quem o assinou, pelo tipo e pelo `conversationId` do envelope. */
function dispatchFrame(destination: string, body: unknown) {
  const kind = classifyDestination(destination);
  if (kind === "errors") {
    const code = typeof body === "object" && body !== null && "code" in body ? String((body as { code: unknown }).code) : "UNKNOWN";
    logger.serviceError({ service: "messenger", operation: "frameRejected", errorCode: code });
    return;
  }
  if (kind !== "events") return;
  const userEvent = parseUserFrame(body);
  if (userEvent) {
    notify(userListeners, userEvent);
    return;
  }
  const event = parseConversationFrame(body);
  if (!event) return;
  if (event.kind === "presence" || event.kind === "presenceSnapshot") {
    presence = applyPresence(presence, event);
    notify(
      [...conversationListeners.values()].flatMap((listeners) => [...listeners]),
      event,
    );
    return;
  }
  const listeners = conversationListeners.get(frameConversationId(body) ?? "");
  if (listeners) notify(listeners, event);
}

/** Entrega ao ouvinte da conversa uma mensagem trazida pelo catch-up, como se tivesse chegado ao vivo. */
function deliverUpdate(message: MessageDto) {
  const listeners = conversationListeners.get(message.conversationId);
  if (listeners) notify(listeners, { kind: "message", change: message.deleted ? "deleted" : message.edited ? "edited" : "created", message });
}

/** Depois de assinar `.events`: busca o que mudou desde o último cursor, página a página; época nova = recarregar tudo. */
async function catchUp(current: Client) {
  const userId = clientUserId;
  if (!userId) return;
  if (catchUpState?.userId !== userId) catchUpState = null;
  const startingPoint = async () => {
    const start = await getMessageUpdates();
    catchUpState = { userId, epoch: start.syncEpoch, cursor: start.cursor };
  };
  try {
    if (!catchUpState) {
      await startingPoint();
      return;
    }
    for (let more = true; more;) {
      const since = catchUpState.cursor;
      const page = await getMessageUpdates(since);
      if (current !== client) return;
      if (page.syncEpoch !== catchUpState.epoch) {
        await startingPoint();
        notify(
          [...conversationListeners.values()].flatMap((listeners) => [...listeners]),
          { kind: "resync" },
        );
        window.dispatchEvent(new Event("solaria:messenger"));
        return;
      }
      page.messages.forEach(deliverUpdate);
      catchUpState.cursor = page.cursor;
      more = page.hasMore && page.cursor > since;
    }
  } catch (error) {
    logger.serviceError({ service: "messenger", operation: "catchUp", error });
  }
}

function receive(destination: string, frame: IFrame) {
  try {
    dispatchFrame(destination, JSON.parse(frame.body));
  } catch (error) {
    logger.serviceError({ service: "messenger", operation: "parseFrame", error });
  }
}

function desiredDestinations(): string[] {
  return hasListeners() && clientUserId ? [userTopic(clientUserId, "events"), userTopic(clientUserId, "errors")] : [];
}

function syncSubscriptions() {
  const current = client;
  if (!current?.connected) return;
  const desired = new Set(desiredDestinations());
  for (const [destination, subscription] of stompSubscriptions) {
    if (desired.has(destination)) continue;
    try {
      subscription.unsubscribe();
    } catch {
      logger.debug("messenger.unsubscribe skipped, connection already closed");
    }
    stompSubscriptions.delete(destination);
  }
  for (const destination of desired) {
    if (stompSubscriptions.has(destination)) continue;
    stompSubscriptions.set(
      destination,
      current.subscribe(destination, (frame) => receive(destination, frame)),
    );
  }
}

function teardown(status: ConnectionState["status"]) {
  clearConnectionTimers();
  clearTimeout(idleTimer);
  idleTimer = undefined;
  const previous = client;
  client = null;
  clientUserId = null;
  refreshBeforeConnect = false;
  presence = EMPTY_PRESENCE;
  stompSubscriptions.clear();
  if (previous) void previous.deactivate().catch(() => undefined);
  setState({ status, attempts: 0 });
}

async function currentSession(): Promise<AuthSession | null> {
  const stored = getAuthSession();
  if (!stored) return null;
  const remaining = Date.parse(stored.accessTokenExpiresAt) - Date.now();
  if (!refreshBeforeConnect && remaining > TOKEN_MARGIN_MS) return stored;
  refreshBeforeConnect = false;
  return refresh();
}

async function prepareConnection(current: Client) {
  if (current !== client) return;
  try {
    const session = await currentSession();
    if (current !== client) return;
    if (!session) {
      teardown("unavailable");
      return;
    }
    clientUserId = session.userId.toLowerCase();
    current.connectHeaders = { Authorization: `Bearer ${session.accessToken}` };
  } catch (error) {
    logger.serviceError({ service: "messenger", operation: "refreshSession", error });
  }
}

function scheduleTokenRenewal(current: Client) {
  const expiresAt = Date.parse(getAuthSession()?.accessTokenExpiresAt ?? "");
  const delay = expiresAt - Date.now() - TOKEN_MARGIN_MS;
  if (!Number.isFinite(delay) || delay <= 0) return;
  renewTimer = setTimeout(
    () => {
      if (current !== client) return;
      refreshBeforeConnect = true;
      current.forceDisconnect();
    },
    Math.min(delay, MAX_TIMER_MS),
  );
}

function handleConnected(current: Client) {
  if (current !== client) return;
  setState({ status: "connected", attempts: 0 });
  syncSubscriptions();
  void catchUp(current);
  clearConnectionTimers();
  pingTimer = setInterval(() => {
    if (current.connected) current.publish({ destination: "/app/presence.ping" });
  }, PING_MS);
  scheduleTokenRenewal(current);
}

function handleClosed(current: Client) {
  if (current !== client) return;
  clearConnectionTimers();
  stompSubscriptions.clear();
  setState({ status: "reconnecting", attempts: state.attempts + 1 });
}

function handleStompError(current: Client, frame: IFrame) {
  if (current !== client) return;
  refreshBeforeConnect = true;
  logger.serviceError({ service: "messenger", operation: "stompError", error: new Error(frame.headers.message ?? "STOMP error") });
}

function createClient(url: string): Client {
  const created: Client = new Client({
    brokerURL: url,
    reconnectDelay: INITIAL_RECONNECT_MS,
    maxReconnectDelay: MAX_RECONNECT_MS,
    reconnectTimeMode: ReconnectionTimeMode.EXPONENTIAL,
    connectionTimeout: CONNECTION_TIMEOUT_MS,
    heartbeatIncoming: HEARTBEAT_MS,
    heartbeatOutgoing: HEARTBEAT_MS,
    beforeConnect: () => prepareConnection(created),
    onConnect: () => handleConnected(created),
    onWebSocketClose: () => handleClosed(created),
    onWebSocketError: () => logger.serviceError({ service: "messenger", operation: "connect" }),
    onStompError: (frame) => handleStompError(created, frame),
  });
  return created;
}

function ensureConnected() {
  clearTimeout(idleTimer);
  idleTimer = undefined;
  const session = getAuthSession();
  if (isAlwaysMockMode("MESSENGER")) {
    clientUserId = session?.userId.toLowerCase() ?? null;
    setState({ status: session ? "connected" : "unavailable", attempts: 0 });
    return;
  }
  if (client) return;
  const url = import.meta.env.VITE_WS_MESSENGER;
  if (!session || !url) {
    setState({ status: "unavailable", attempts: 0 });
    return;
  }
  clientUserId = session.userId.toLowerCase();
  client = createClient(url);
  setState({ status: "connecting", attempts: 0 });
  client.activate();
}

function scheduleIdleDisconnect() {
  if (hasListeners() || idleTimer) return;
  idleTimer = setTimeout(() => {
    idleTimer = undefined;
    if (!hasListeners()) teardown("idle");
  }, IDLE_DISCONNECT_MS);
}

function release<T>(listeners: Set<T>, listener: T, onEmpty?: () => void) {
  if (!listeners.delete(listener)) return;
  if (listeners.size === 0) onEmpty?.();
  syncSubscriptions();
  scheduleIdleDisconnect();
}

export function subscribeToConversation(conversationId: string, listener: ConversationListener): () => void {
  const listeners = conversationListeners.get(conversationId) ?? new Set<ConversationListener>();
  listeners.add(listener);
  conversationListeners.set(conversationId, listeners);
  ensureConnected();
  syncSubscriptions();
  for (const event of presenceEvents(presence)) notify([listener], event);
  return () => release(listeners, listener, () => conversationListeners.delete(conversationId));
}

export function subscribeToUserEvents(listener: UserListener): () => void {
  userListeners.add(listener);
  ensureConnected();
  syncSubscriptions();
  return () => release(userListeners, listener);
}

export function subscribeToConnection(listener: () => void): () => void {
  connectionListeners.add(listener);
  return () => {
    connectionListeners.delete(listener);
  };
}

export function getConnectionState(): ConnectionState {
  return state;
}

export function publishTyping(conversationId: string, typing: boolean): void {
  const current = client;
  if (!current?.connected) return;
  current.publish({ destination: typing ? "/app/typing.started" : "/app/typing.stopped", body: JSON.stringify({ conversationId }) });
}

export function disconnectMessenger(): void {
  catchUpState = null;
  teardown(hasListeners() ? "unavailable" : "idle");
}

export function emitMockFrame(destination: string, body: unknown): void {
  dispatchFrame(destination, body);
}

function handleSessionChange() {
  const session = getAuthSession();
  if (!session) {
    if (client || state.status !== "idle") disconnectMessenger();
    return;
  }
  if (client && clientUserId !== session.userId.toLowerCase()) teardown("idle");
  if (hasListeners() && !client) ensureConnected();
}

if (typeof window !== "undefined") {
  window.addEventListener("solaria:session", handleSessionChange);
  window.addEventListener("storage", (event) => {
    if (event.key === null || event.key === "solaria.authSession") handleSessionChange();
  });
}
