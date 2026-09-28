import type { Message } from "./messages";

import { resolveWithMocks } from "@/config/mocks/fallback.service";
import { addMockMessage, getMockMessages } from "@/config/mocks/mockState.service";
import { httpJson } from "@/shared/http/http.service";

const API = import.meta.env.VITE_API_CORE;
const SERVICE_NAME = "messages";

export function getMessages(chatId: string): Promise<Message[]> {
  return resolveWithMocks(
    () =>
      httpJson<Message[]>(`${API}/chats/${chatId}/messages`, {
        service: SERVICE_NAME,
        operation: "getMessages",
        errorMessage: `Não foi possível obter as mensagens do chat ${chatId}`,
      }),
    () => getMockMessages(chatId),
  );
}

export function sendMessage(chatId: string, message: Message): Promise<Message> {
  return resolveWithMocks(
    () =>
      httpJson<Message>(`${API}/chats/${chatId}/messages`, {
        service: SERVICE_NAME,
        operation: "sendMessage",
        method: "POST",
        body: message,
        errorMessage: `Não foi possível enviar a mensagem no chat ${chatId}`,
      }),
    () => {
      addMockMessage(chatId, message);
      return message;
    },
  );
}
