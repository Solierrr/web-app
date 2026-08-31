import type { Message } from "./messages";

import messagesMock from "./messages.d.mock";
import { resolveWithMocks } from "@/config/mocks/fallback.service";

const API = import.meta.env.VITE_API_PERSISTENCE;

export function getMessages(chatId: string): Promise<Message[]> {
  return resolveWithMocks(
    async () => {
      const response = await fetch(`${API}/chats/${chatId}/messages`);
      if (!response.ok) {
        throw new Error(`Não foi possível obter as mensagens do chat ${chatId}`);
      }
      return response.json();
    },
    () => messagesMock,
  );
}

export function sendMessage(chatId: string, message: Message): Promise<Message> {
  return resolveWithMocks(
    async () => {
      const response = await fetch(`${API}/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });
      if (!response.ok) {
        throw new Error(`Não foi possível enviar a mensagem no chat ${chatId}`);
      }
      return response.json();
    },
    () => message,
  );
}
