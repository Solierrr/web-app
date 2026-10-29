import { getAuthSession } from "@/lib/shared/auth/authToken.utils";

const MAX_THREADS = 50;

function key(): string {
  return `solaria.assistantThreads.${getAuthSession()?.userId ?? "anonymous"}`;
}

function read(): Record<string, string> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key()) ?? "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, string>) : {};
  } catch {
    return {};
  }
}

/** O `ai-assistant` identifica a conversa por um `thread_id` e cria a conversa do messenger sozinho; o vínculo entre os dois fica neste navegador. */
export function rememberAssistantThread(conversationId: string, threadId: string): void {
  try {
    const entries = Object.entries(read()).filter(([id]) => id !== conversationId);
    entries.push([conversationId, threadId]);
    localStorage.setItem(key(), JSON.stringify(Object.fromEntries(entries.slice(-MAX_THREADS))));
  } catch {
    return;
  }
}

export function getAssistantThread(conversationId: string): string {
  return read()[conversationId] ?? conversationId;
}

export function findAssistantConversation(threadId: string): string | undefined {
  return Object.entries(read()).find(([, thread]) => thread === threadId)?.[0];
}
