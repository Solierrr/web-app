import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthSession } from "@/features/access/access";
import type { ConversationEvent, UserEvent } from "./messages.messenger.realtime";

const USER_ID = "0b9c7a4e-6d1f-4c5e-9a43-2f7d8e1b6a10";
const OTHER_USER_ID = "7e2a1d90-3b44-4a8e-b3c1-5d6f9a0c2e88";

interface FakeSubscription {
  callback: (frame: { body: string }) => void;
  unsubscribe: ReturnType<typeof vi.fn>;
}

const fake = vi.hoisted(() => {
  class FakeClient {
    static instances: FakeClient[] = [];
    config: Record<string, unknown>;
    connected = false;
    connectHeaders: Record<string, string> = {};
    subscriptions = new Map<string, FakeSubscription>();
    published: { destination: string; body?: string }[] = [];
    activate = vi.fn();
    deactivate = vi.fn(async () => {
      this.connected = false;
    });
    forceDisconnect = vi.fn(() => this.drop());
    constructor(config: Record<string, unknown>) {
      this.config = config;
      FakeClient.instances.push(this);
    }
    subscribe = vi.fn((destination: string, callback: (frame: { body: string }) => void) => {
      const subscription: FakeSubscription = {
        callback,
        unsubscribe: vi.fn(() => {
          this.subscriptions.delete(destination);
        }),
      };
      this.subscriptions.set(destination, subscription);
      return subscription;
    });
    publish = vi.fn((message: { destination: string; body?: string }) => {
      this.published.push(message);
    });
    async open() {
      await (this.config.beforeConnect as (client: FakeClient) => Promise<void>)(this);
      this.connected = true;
      (this.config.onConnect as () => void)();
    }
    drop() {
      this.connected = false;
      this.subscriptions.clear();
      (this.config.onWebSocketClose as () => void)();
    }
    emit(destination: string, body: unknown) {
      this.subscriptions.get(destination)?.callback({ body: JSON.stringify(body) });
    }
    reject(message: string) {
      (this.config.onStompError as (frame: { headers: Record<string, string> }) => void)({ headers: { message } });
    }
  }
  return { FakeClient, ReconnectionTimeMode: { LINEAR: 0, EXPONENTIAL: 1 } };
});

const state = vi.hoisted(() => ({ session: null as AuthSession | null, refresh: vi.fn(), mock: false }));

vi.mock("@stomp/stompjs", () => ({ Client: fake.FakeClient, ReconnectionTimeMode: fake.ReconnectionTimeMode }));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => state.session }));
vi.mock("@/features/access/access.service", () => ({ refresh: state.refresh }));
vi.mock("@/config/mocks/mockMode.utils", () => ({ isAlwaysMockMode: () => state.mock }));
vi.mock("@/config/logging/logger", () => ({ default: { serviceError: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

function session(overrides: Partial<AuthSession> = {}): AuthSession {
  return {
    accessToken: "token-a",
    refreshToken: "refresh-a",
    accessTokenExpiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    userId: USER_ID,
    email: "user@example.com",
    ...overrides,
  };
}

const message = (sequence: number, extra: Record<string, unknown> = {}) => ({
  id: `msg-${sequence}`,
  conversationId: "conv-1",
  senderId: OTHER_USER_ID,
  content: `Message ${sequence}`,
  timestamp: "2026-10-28T12:00:00Z",
  sequence,
  ...extra,
});

type Socket = typeof import("./messages.messenger.socket");
let socket: Socket;
let windowListeners: [string, EventListenerOrEventListenerObject][] = [];

function lastClient() {
  return fake.FakeClient.instances[fake.FakeClient.instances.length - 1];
}

async function connect(conversationId = "conv-1") {
  const events: ConversationEvent[] = [];
  const unsubscribe = socket.subscribeToConversation(conversationId, (event) => events.push(event));
  await lastClient().open();
  return { events, unsubscribe, client: lastClient() };
}

describe("messenger socket", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    vi.stubEnv("VITE_WS_MESSENGER", "wss://messenger.example.com/messaging/ws");
    fake.FakeClient.instances.length = 0;
    state.session = session();
    state.mock = false;
    state.refresh.mockReset();
    windowListeners = [];
    const addListener = window.addEventListener.bind(window);
    vi.spyOn(window, "addEventListener").mockImplementation(
      (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
        windowListeners.push([type, listener]);
        addListener(type, listener, options);
      },
    );
    socket = await import("./messages.messenger.socket");
  });
  afterEach(() => {
    socket.disconnectMessenger();
    windowListeners.forEach(([type, listener]) => window.removeEventListener(type, listener));
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("connects with the current token, heartbeat and exponential backoff", async () => {
    expect(socket.getConnectionState()).toEqual({ status: "idle", attempts: 0 });
    const { client } = await connect();
    expect(client.config).toMatchObject({
      brokerURL: "wss://messenger.example.com/messaging/ws",
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      reconnectDelay: 1_000,
      maxReconnectDelay: 30_000,
      reconnectTimeMode: fake.ReconnectionTimeMode.EXPONENTIAL,
    });
    expect(client.connectHeaders).toEqual({ Authorization: "Bearer token-a" });
    expect(client.activate).toHaveBeenCalledTimes(1);
    expect(socket.getConnectionState()).toEqual({ status: "connected", attempts: 0 });
  });

  it("subscribes to the conversation topic and delivers live messages", async () => {
    const { events, client } = await connect();
    expect([...client.subscriptions.keys()]).toEqual(["/topic/conversations.conv-1"]);
    client.emit("/topic/conversations.conv-1", { type: "MESSAGE_CREATED", conversationId: "conv-1", payload: message(4) });
    client.emit("/topic/conversations.conv-1", {
      type: "MESSAGE_DELETED",
      conversationId: "conv-1",
      payload: message(4, { deleted: true, content: "" }),
    });
    expect(events).toEqual([
      expect.objectContaining({ kind: "message", change: "created", message: expect.objectContaining({ id: "msg-4", sequence: 4 }) }),
      expect.objectContaining({ kind: "message", change: "deleted", message: expect.objectContaining({ deleted: true }) }),
    ]);
  });

  it("delivers typing and presence events with normalized user ids", async () => {
    const { events, client } = await connect();
    const topic = "/topic/conversations.conv-1";
    client.emit(topic, { type: "TYPING_STARTED", conversationId: "conv-1", payload: { userId: OTHER_USER_ID.toUpperCase() } });
    client.emit(topic, { type: "TYPING_STOPPED", conversationId: "conv-1", payload: { userId: OTHER_USER_ID } });
    client.emit(topic, { type: "USER_ONLINE", payload: { userId: OTHER_USER_ID, presenceEpoch: "e1", presenceVersion: 3 } });
    client.emit(topic, {
      type: "PRESENCE_SNAPSHOT",
      payload: { users: { [OTHER_USER_ID]: true, [USER_ID]: false }, presenceEpoch: "e1", presenceVersion: 2 },
    });
    expect(events).toEqual([
      { kind: "typing", userId: OTHER_USER_ID, typing: true },
      { kind: "typing", userId: OTHER_USER_ID, typing: false },
      { kind: "presence", userId: OTHER_USER_ID, online: true, epoch: "e1", version: 3 },
      { kind: "presenceSnapshot", users: { [OTHER_USER_ID]: true, [USER_ID]: false }, epoch: "e1", version: 2 },
    ]);
  });

  it("ignores malformed frames without breaking other listeners", async () => {
    const { events, client } = await connect();
    const failing = socket.subscribeToConversation("conv-1", () => {
      throw new Error("listener failure");
    });
    client.subscriptions.get("/topic/conversations.conv-1")?.callback({ body: "not json" });
    client.emit("/topic/conversations.conv-1", { type: "MESSAGE_CREATED", payload: { nope: true } });
    client.emit("/topic/conversations.conv-1", { type: "MESSAGE_CREATED", payload: message(1) });
    expect(events).toHaveLength(1);
    failing();
  });

  it("shares one STOMP subscription per conversation and releases it with the last listener", async () => {
    const { client, unsubscribe } = await connect();
    const second = socket.subscribeToConversation("conv-1", () => undefined);
    expect(client.subscribe).toHaveBeenCalledTimes(1);
    unsubscribe();
    expect(client.subscriptions.has("/topic/conversations.conv-1")).toBe(true);
    second();
    expect(client.subscriptions.has("/topic/conversations.conv-1")).toBe(false);
    second();
    expect(client.subscribe).toHaveBeenCalledTimes(1);
  });

  it("closes the connection after the last listener leaves and reopens on demand", async () => {
    const { client, unsubscribe } = await connect();
    unsubscribe();
    await vi.advanceTimersByTimeAsync(9_000);
    expect(client.deactivate).not.toHaveBeenCalled();
    const keep = socket.subscribeToConversation("conv-2", () => undefined);
    await vi.advanceTimersByTimeAsync(5_000);
    expect(client.deactivate).not.toHaveBeenCalled();
    keep();
    await vi.advanceTimersByTimeAsync(10_000);
    expect(client.deactivate).toHaveBeenCalledTimes(1);
    expect(socket.getConnectionState().status).toBe("idle");
    socket.subscribeToConversation("conv-3", () => undefined);
    expect(fake.FakeClient.instances).toHaveLength(2);
  });

  it("subscribes to the private user topics for conversation updates", async () => {
    const events: UserEvent[] = [];
    socket.subscribeToUserEvents((event) => events.push(event));
    const client = lastClient();
    await client.open();
    expect([...client.subscriptions.keys()].sort()).toEqual([`/topic/users.${USER_ID}.conversations`, `/topic/users.${USER_ID}.errors`]);
    client.emit(`/topic/users.${USER_ID}.conversations`, {
      type: "CONVERSATION_UPDATED",
      conversationId: "conv-1",
      payload: {
        id: "conv-1",
        syncEpoch: "epoch-1",
        syncVersion: 8,
        conversationType: "DIRECT",
        participantIds: [USER_ID, OTHER_USER_ID],
        title: null,
        lastInteractionAt: "2026-10-28T12:00:00Z",
        unreadCount: 3,
        lastReadSequence: 4,
      },
    });
    client.emit(`/topic/users.${USER_ID}.conversations`, {
      type: "CONVERSATION_REMOVED",
      payload: { id: "conv-9", syncEpoch: "epoch-1", syncVersion: 9 },
    });
    client.emit(`/topic/users.${USER_ID}.errors`, { code: "SUBSCRIBE_NOT_ALLOWED", message: "denied" });
    expect(events).toEqual([
      {
        kind: "conversationUpdated",
        conversation: expect.objectContaining({
          id: "conv-1",
          unreadCount: 3,
          lastReadSequence: 4,
          syncVersion: 8,
          participantIds: [USER_ID, OTHER_USER_ID],
        }),
      },
      { kind: "conversationRemoved", id: "conv-9" },
    ]);
  });

  it("refreshes a token that is about to expire before connecting", async () => {
    state.session = session({ accessTokenExpiresAt: new Date(Date.now() + 20_000).toISOString() });
    state.refresh.mockResolvedValue(session({ accessToken: "token-b" }));
    const { client } = await connect();
    expect(state.refresh).toHaveBeenCalledTimes(1);
    expect(client.connectHeaders).toEqual({ Authorization: "Bearer token-b" });
  });

  it("keeps trying with the stored token when the refresh call fails", async () => {
    state.session = session({ accessTokenExpiresAt: new Date(Date.now() + 20_000).toISOString() });
    state.refresh.mockRejectedValue(new Error("auth service is waking up"));
    const { client } = await connect();
    expect(client.connected).toBe(true);
    expect(socket.getConnectionState().status).toBe("connected");
  });

  it("refreshes the token on the next attempt after the broker rejects the connection", async () => {
    const { client } = await connect();
    state.refresh.mockResolvedValue(session({ accessToken: "token-c" }));
    client.reject("Token expirado durante a conexao.");
    client.drop();
    expect(socket.getConnectionState()).toEqual({ status: "reconnecting", attempts: 1 });
    await client.open();
    expect(state.refresh).toHaveBeenCalledTimes(1);
    expect(client.connectHeaders).toEqual({ Authorization: "Bearer token-c" });
  });

  it("renews the token before it expires by reconnecting", async () => {
    state.session = session({ accessTokenExpiresAt: new Date(Date.now() + 5 * 60_000).toISOString() });
    const { client } = await connect();
    state.refresh.mockResolvedValue(session({ accessToken: "token-d" }));
    await vi.advanceTimersByTimeAsync(4 * 60_000 + 1_000);
    expect(client.forceDisconnect).toHaveBeenCalledTimes(1);
    await client.open();
    expect(client.connectHeaders).toEqual({ Authorization: "Bearer token-d" });
  });

  it("reports the reconnection attempts and restores every subscription once back", async () => {
    const { events, client } = await connect();
    socket.subscribeToConversation("conv-2", () => undefined);
    client.drop();
    expect(socket.getConnectionState()).toEqual({ status: "reconnecting", attempts: 1 });
    client.drop();
    expect(socket.getConnectionState()).toEqual({ status: "reconnecting", attempts: 2 });
    await client.open();
    expect(socket.getConnectionState()).toEqual({ status: "connected", attempts: 0 });
    expect([...client.subscriptions.keys()].sort()).toEqual(["/topic/conversations.conv-1", "/topic/conversations.conv-2"]);
    client.emit("/topic/conversations.conv-1", { type: "MESSAGE_CREATED", payload: message(7) });
    expect(events).toHaveLength(1);
  });

  it("notifies connection listeners about every state change", async () => {
    const seen: string[] = [];
    const stop = socket.subscribeToConnection(() => seen.push(socket.getConnectionState().status));
    const { client } = await connect();
    client.drop();
    await client.open();
    stop();
    expect(seen).toEqual(["connecting", "connected", "reconnecting", "connected"]);
  });

  it("stays unavailable without a session or a configured endpoint", () => {
    state.session = null;
    socket.subscribeToConversation("conv-1", () => undefined);
    expect(fake.FakeClient.instances).toHaveLength(0);
    expect(socket.getConnectionState().status).toBe("unavailable");
  });

  it("disconnects on logout and reconnects when a session returns", async () => {
    const { client } = await connect();
    state.session = null;
    window.dispatchEvent(new Event("solaria:session"));
    expect(client.deactivate).toHaveBeenCalledTimes(1);
    expect(socket.getConnectionState().status).toBe("unavailable");
    client.drop();
    expect(socket.getConnectionState().status).toBe("unavailable");
    state.session = session({ accessToken: "token-next" });
    window.dispatchEvent(new Event("solaria:session"));
    expect(fake.FakeClient.instances).toHaveLength(2);
    await lastClient().open();
    expect(lastClient().connectHeaders).toEqual({ Authorization: "Bearer token-next" });
    expect(socket.getConnectionState().status).toBe("connected");
  });

  it("stops without reconnecting when the session cannot be renewed", async () => {
    state.session = session({ accessTokenExpiresAt: new Date(Date.now() + 1_000).toISOString() });
    state.refresh.mockResolvedValue(null);
    socket.subscribeToConversation("conv-1", () => undefined);
    const client = lastClient();
    await (client.config.beforeConnect as (current: unknown) => Promise<void>)(client);
    expect(client.deactivate).toHaveBeenCalledTimes(1);
    expect(socket.getConnectionState().status).toBe("unavailable");
  });

  it("switches connection when another user signs in", async () => {
    const { client } = await connect();
    state.session = session({ userId: OTHER_USER_ID });
    window.dispatchEvent(new Event("solaria:session"));
    expect(client.deactivate).toHaveBeenCalledTimes(1);
    expect(fake.FakeClient.instances).toHaveLength(2);
  });

  it("publishes typing, stops typing and presence pings only while connected", async () => {
    socket.subscribeToConversation("conv-1", () => undefined);
    const client = lastClient();
    socket.publishTyping("conv-1", true);
    expect(client.published).toEqual([]);
    await client.open();
    socket.publishTyping("conv-1", true);
    socket.publishTyping("conv-1", false);
    expect(client.published).toEqual([
      { destination: "/app/typing.started", body: JSON.stringify({ conversationId: "conv-1" }) },
      { destination: "/app/typing.stopped", body: JSON.stringify({ conversationId: "conv-1" }) },
    ]);
    await vi.advanceTimersByTimeAsync(30_000);
    expect(client.published.at(-1)).toEqual({ destination: "/app/presence.ping" });
    client.drop();
    const sent = client.published.length;
    await vi.advanceTimersByTimeAsync(60_000);
    expect(client.published).toHaveLength(sent);
  });

  it("simulates the same event path without a socket when the messenger is mocked", () => {
    state.mock = true;
    const events: ConversationEvent[] = [];
    socket.subscribeToConversation("conv-1", (event) => events.push(event));
    expect(fake.FakeClient.instances).toHaveLength(0);
    expect(socket.getConnectionState()).toEqual({ status: "connected", attempts: 0 });
    socket.emitMockFrame("/topic/conversations.conv-1", { type: "TYPING_STARTED", payload: { userId: OTHER_USER_ID } });
    expect(events).toEqual([{ kind: "typing", userId: OTHER_USER_ID, typing: true }]);
  });
});
