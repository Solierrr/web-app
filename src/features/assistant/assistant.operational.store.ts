import { useSyncExternalStore } from "react";
import { AgentChatError } from "@/features/error/agent-chat/AgentChat.error";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { sendOperationalTurn } from "./assistant.service";
import { CONFIRM_MESSAGE, DECLINE_MESSAGE, hasPendingProposal } from "./assistant.utils";

export interface OperationalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  decision?: "confirm" | "decline";
  status?: "queued" | "sending" | "failed";
  reason?: string;
  proposal?: boolean;
}

export interface OperationalState {
  threadId: string;
  messages: OperationalMessage[];
}

const MAX_MESSAGES = 60;
const listeners = new Set<() => void>();
let loaded: { key: string; state: OperationalState } | null = null;
let running = false;

function storageKey(): string {
  return `solaria.operationalAssistant.${getAuthSession()?.userId ?? "anonymous"}`;
}

function fresh(): OperationalState {
  return { threadId: crypto.randomUUID(), messages: [] };
}

function restore(key: string): OperationalState {
  try {
    const raw: unknown = JSON.parse(sessionStorage.getItem(key) ?? "null");
    const stored = raw as Partial<OperationalState> | null;
    if (!stored || typeof stored.threadId !== "string" || !Array.isArray(stored.messages)) return fresh();
    const messages = stored.messages.map((message) =>
      message.status === "sending" || message.status === "queued" ? { ...message, status: "failed" as const } : message,
    );
    return { threadId: stored.threadId, messages };
  } catch {
    return fresh();
  }
}

function current(): { key: string; state: OperationalState } {
  const key = storageKey();
  if (!loaded || loaded.key !== key) loaded = { key, state: restore(key) };
  return loaded;
}

function commit(next: OperationalState): void {
  const { key } = current();
  const state = { ...next, messages: next.messages.slice(-MAX_MESSAGES) };
  loaded = { key, state };
  try {
    sessionStorage.setItem(key, JSON.stringify(state));
  } catch {
    loaded = { key, state };
  }
  listeners.forEach((listener) => listener());
}

function update(change: (messages: OperationalMessage[]) => OperationalMessage[]): void {
  const { state } = current();
  commit({ ...state, messages: change(state.messages) });
}

function patch(id: string, changes: Partial<OperationalMessage>): void {
  update((messages) => messages.map((message) => (message.id === id ? { ...message, ...changes } : message)));
}

async function pump(): Promise<void> {
  if (running) return;
  running = true;
  try {
    for (;;) {
      const { state } = current();
      const next = state.messages.find((message) => message.role === "user" && message.status === "queued");
      if (!next) return;
      const { threadId } = state;
      patch(next.id, { status: "sending", reason: undefined });
      try {
        const reply = await sendOperationalTurn(threadId, next.content);
        if (current().state.threadId !== threadId) continue;
        update((messages) => [
          ...messages.map((message) => (message.id === next.id ? { ...message, status: undefined } : message)),
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: reply.response,
            createdAt: new Date().toISOString(),
            proposal: hasPendingProposal(reply),
          },
        ]);
      } catch (error) {
        patch(next.id, { status: "failed", reason: error instanceof AgentChatError ? error.message : undefined });
        return;
      }
    }
  } finally {
    running = false;
  }
}

function enqueue(content: string, decision?: OperationalMessage["decision"]): void {
  update((messages) => [
    ...messages.map((message) => (message.proposal ? { ...message, proposal: false } : message)),
    { id: crypto.randomUUID(), role: "user", content, createdAt: new Date().toISOString(), status: "queued", decision },
  ]);
  void pump();
}

export function sendOperationalMessage(text: string): void {
  const content = text.trim();
  if (content) enqueue(content);
}

export function answerOperationalProposal(accept: boolean): void {
  enqueue(accept ? CONFIRM_MESSAGE : DECLINE_MESSAGE, accept ? "confirm" : "decline");
}

export function retryOperationalMessage(id: string): void {
  patch(id, { status: "queued", reason: undefined });
  void pump();
}

export function discardOperationalMessage(id: string): void {
  update((messages) => messages.filter((message) => message.id !== id));
  void pump();
}

export function resetOperationalConversation(): void {
  commit(fresh());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("solaria:session", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("solaria:session", listener);
  };
}

export function getOperationalConversation(): OperationalState {
  return current().state;
}

export function useOperationalConversation(): OperationalState {
  return useSyncExternalStore(subscribe, getOperationalConversation, getOperationalConversation);
}
