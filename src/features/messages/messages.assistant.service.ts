import { createChatbotConversation, sendConversationMessage, type ConversationDto } from "./messages.messenger.api";

/** Abre uma sessão do assistente e, se houver texto, já envia a primeira mensagem. `sendFailed` indica que a conversa existe, mas o texto não foi enviado. */
export async function startAssistantConversation(userType: string, text?: string): Promise<{ conversation: ConversationDto; sendFailed: boolean }> {
  const conversation = await createChatbotConversation(userType);
  if (!text) return { conversation, sendFailed: false };
  try {
    await sendConversationMessage(conversation.id, text, "CHAT_BOT");
  } catch {
    return { conversation, sendFailed: true };
  }
  window.dispatchEvent(new Event("solaria:messenger"));
  return { conversation, sendFailed: false };
}
