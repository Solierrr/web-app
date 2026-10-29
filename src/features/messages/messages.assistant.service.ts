import { sendAssistantTurn } from "@/features/assistant/assistant.service";
import { getConversation, type ConversationDto } from "./messages.messenger.api";
import { rememberAssistantThread } from "./messages.assistant.utils";

export async function startAssistantConversation(text: string): Promise<ConversationDto> {
  const threadId = crypto.randomUUID();
  const { messengerConversationId } = await sendAssistantTurn(threadId, text);
  rememberAssistantThread(messengerConversationId, threadId);
  window.dispatchEvent(new Event("solaria:messenger"));
  try {
    return await getConversation(messengerConversationId);
  } catch {
    return { id: messengerConversationId, conversationType: "CHAT_BOT", participantIds: [], title: null, lastInteractionAt: null };
  }
}
