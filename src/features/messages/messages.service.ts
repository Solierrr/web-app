import i18n from "@/config/i18n/internationalization";
import type { Message } from "./messages";

import { messagesMocks } from "@/config/mocks/registry";
import { resolveWithMocks } from "@/config/mocks/fallback.service";
import { httpJson } from "@/lib/shared/http/http.service";

const API = import.meta.env.VITE_API_CORE;
const SERVICE_NAME = "messages";

export function getMessages(chatId: string): Promise<Message[]> {
  return resolveWithMocks(
    () =>
      httpJson<Message[]>(`${API}/chats/${chatId}/messages`, {
        service: SERVICE_NAME,
        operation: "getMessages",
        errorMessage: i18n.t("services:messages.getMessages", { chatId }),
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
        errorMessage: i18n.t("services:messages.sendMessage", { chatId }),
      }),
    () => message,
  );
}
