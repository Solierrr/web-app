import i18n from "@/config/i18n/internationalization";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import { AgentChatError } from "@/features/error/agent-chat/AgentChat.error";
import { retryAfterRefresh } from "@/lib/shared/auth/authRetry.utils";
import { httpJson } from "@/lib/shared/http/http.service";
import type { AgentChatPayload, AgentReply, AssistantTurn } from "./assistant";
import { mockAssistantTurn, mockOperationalReply } from "./assistant.d.mocks";

const TIMEOUT_MS = 120_000;

function toStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

async function chat(base: string | undefined, service: string, threadId: string, message: string): Promise<AgentReply> {
  let payload: AgentChatPayload;
  try {
    payload = await retryAfterRefresh(() =>
      httpJson<AgentChatPayload>(`${base?.replace(/\/$/, "")}/chat`, {
        service,
        operation: "chat",
        method: "POST",
        body: { conversation_id: threadId, message },
        timeoutMs: TIMEOUT_MS,
        errorMessage: i18n.t("chat:agent.errors.unknown"),
      }),
    );
  } catch (error) {
    throw AgentChatError.fromFailure(error);
  }
  if (typeof payload?.response !== "string") throw AgentChatError.unexpectedReply();
  return {
    response: payload.response,
    specialistsUsed: toStrings(payload.specialists_used),
    workflowSteps: toStrings(payload.workflow_steps),
    messengerConversationId: typeof payload.messenger_conversation_id === "string" ? payload.messenger_conversation_id : null,
  };
}

/** Um turno com o `ai-assistant`; o próprio agente grava a pergunta e a resposta na conversa do messenger devolvida. */
export async function sendAssistantTurn(threadId: string, message: string): Promise<AssistantTurn> {
  if (isAlwaysMockMode("AI")) return mockAssistantTurn(threadId, message);
  const reply = await chat(import.meta.env.VITE_API_ASSISTANT, "aiAssistant", threadId, message);
  if (!reply.messengerConversationId) throw AgentChatError.unexpectedReply();
  return { response: reply.response, messengerConversationId: reply.messengerConversationId };
}

/** Um turno com o `ai-operational`, que não grava nada no messenger. */
export async function sendOperationalTurn(threadId: string, message: string): Promise<AgentReply> {
  if (isAlwaysMockMode("AI")) return mockOperationalReply(message);
  return chat(import.meta.env.VITE_API_OPERATIONAL, "aiOperational", threadId, message);
}
