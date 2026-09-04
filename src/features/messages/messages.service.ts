import type { Message } from "./messages";

import { messagesMocks } from "@/config/mocks/registry";
import { resolveWithMocks } from "@/config/mocks/fallback.service";
import { httpJson } from "@/shared/http/http.service";

const API = import.meta.env.VITE_API_PERSISTENCE;
const SERVICE_NAME = "messages";

export function getMessages(chatId: string): Promise<Message[]> {
  return resolveWithMocks(
    () =>
      httpJson<Message[]>(`${API}/chats/${chatId}/messages`, {
        service: SERVICE_NAME,
        operation: "getMessages",
        errorMessage: `Não foi possível obter as mensagens do chat ${chatId}`,
      }),
    () => messagesMocks,
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
    () => message,
  );
}
