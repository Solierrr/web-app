import i18n from "@/config/i18n/internationalization";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { HttpResponseError, httpJson } from "@/lib/shared/http/http.service";
import type { ConversationDto, MessageDto } from "./messages.messenger.api";
import { sendMockMessage } from "./messages.messenger.d.mocks";

const API = `${import.meta.env.VITE_API_MESSENGER?.replace(/\/$/, "")}/messaging`;

export type AttachmentType = "IMAGE" | "VIDEO" | "AUDIO" | "FILE" | "LOCATION";

/** Anexo como o messenger devolve: a mídia só cita o `mediaId`; o arquivo é retirado por `downloadPath` até `expiresAt`. */
export interface AttachmentDto {
  type: AttachmentType;
  mediaId?: string;
  mimeType?: string;
  sizeBytes?: number;
  name?: string;
  width?: number;
  height?: number;
  durationMs?: number;
  expiresAt?: string;
  downloadPath?: string;
  latitude?: number;
  longitude?: number;
  label?: string;
}

interface UploadTicket {
  mediaId: string;
  upload: { url: string; method: string; headers: Record<string, string> };
  uploadExpiresAt: string;
  maxBytes: number;
}

/** Tetos do servidor por tipo; acima disso nem pede a permissão de envio. */
export const MEDIA_LIMITS: Record<Exclude<AttachmentType, "LOCATION">, number> = {
  IMAGE: 10 * 1024 * 1024,
  AUDIO: 16 * 1024 * 1024,
  VIDEO: 64 * 1024 * 1024,
  FILE: 25 * 1024 * 1024,
};

/** Arquivo que passou do teto do tipo dele. */
export class MediaTooLargeError extends Error {
  constructor(public readonly limitBytes: number) {
    super("MEDIA_TOO_LARGE");
  }
}

/** Mídia que o servidor já apagou (7 dias) ou que não está mais disponível. */
export class MediaUnavailableError extends Error {
  constructor() {
    super("MEDIA_EXPIRED");
  }
}

export function attachmentTypeOf(file: File): Exclude<AttachmentType, "LOCATION"> {
  if (file.type.startsWith("image/")) return "IMAGE";
  if (file.type.startsWith("audio/")) return "AUDIO";
  if (file.type.startsWith("video/")) return "VIDEO";
  return "FILE";
}

function messageType(conversationType: ConversationDto["conversationType"]): MessageDto["messageType"] {
  return conversationType === "GROUP" ? "USER_TO_GROUP" : "USER_TO_USER";
}

async function imageSize(file: File): Promise<{ width?: number; height?: number }> {
  if (typeof createImageBitmap !== "function") return {};
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return {};
  }
}

function postMessage(conversation: ConversationDto, content: string, attachment: AttachmentDto, clientMessageId: string): Promise<MessageDto> {
  return httpJson<MessageDto>(`${API}/messages`, {
    service: "messenger",
    operation: "sendAttachment",
    method: "POST",
    body: { conversationId: conversation.id, clientMessageId, messageType: messageType(conversation.conversationType), content, attachment },
    errorMessage: i18n.t("services:messenger.sendAttachment"),
  });
}

/**
 * Envia um arquivo em três passos: pede a permissão (`POST /media`), deposita os bytes direto no bucket com o método e os
 * cabeçalhos assinados (sem o token da conta, que nunca vai a outro host) e grava a mensagem citando o `mediaId`.
 */
export async function sendFileAttachment(conversation: ConversationDto, file: File, caption: string, clientMessageId: string): Promise<MessageDto> {
  const type = attachmentTypeOf(file);
  if (file.size > MEDIA_LIMITS[type]) throw new MediaTooLargeError(MEDIA_LIMITS[type]);
  const mimeType = file.type || "application/octet-stream";
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    const mediaId = crypto.randomUUID();
    mockFiles.set(mediaId, file);
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
    return {
      ...sendMockMessage(conversation.id, caption, clientMessageId),
      attachment: { type, mediaId, mimeType, sizeBytes: file.size, name: file.name, expiresAt, downloadPath: `/messaging/media/${mediaId}/content` },
    };
  }
  const ticket = await httpJson<UploadTicket>(`${API}/media`, {
    service: "messenger",
    operation: "createMediaUpload",
    method: "POST",
    body: { conversationId: conversation.id, type, mimeType, sizeBytes: file.size },
    errorMessage: i18n.t("services:messenger.sendAttachment"),
  });
  const uploaded = await fetch(ticket.upload.url, { method: ticket.upload.method, headers: ticket.upload.headers, body: file });
  if (!uploaded.ok)
    throw new Error(i18n.t("services:messenger.sendAttachment"), { cause: new HttpResponseError(uploaded.status, "MEDIA_UPLOAD_FAILED") });
  const size = type === "IMAGE" ? await imageSize(file) : {};
  return postMessage(
    conversation,
    caption,
    { type, mediaId: ticket.mediaId, mimeType, sizeBytes: file.size, name: file.name, ...size },
    clientMessageId,
  );
}

/** A localização viaja na própria mensagem, sem passar pelo bucket. */
export async function sendLocationAttachment(
  conversation: ConversationDto,
  location: { latitude: number; longitude: number; label?: string },
  clientMessageId: string,
): Promise<MessageDto> {
  const attachment: AttachmentDto = { type: "LOCATION", ...location };
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return { ...sendMockMessage(conversation.id, "", clientMessageId), attachment };
  }
  return postMessage(conversation, "", attachment, clientMessageId);
}

export function isExpired(attachment: AttachmentDto, now = Date.now()): boolean {
  return !!attachment.expiresAt && Date.parse(attachment.expiresAt) <= now;
}

const mockFiles = new Map<string, Blob>();

/**
 * Baixa a mídia pelo messenger, que responde 302 para um link assinado de 10 minutos. O navegador segue o redirecionamento e
 * não leva o `Authorization` para o host do bucket. 410 ou 404 viram [MediaUnavailableError].
 */
export async function downloadAttachment(attachment: AttachmentDto): Promise<Blob> {
  if (!attachment.mediaId || isExpired(attachment)) throw new MediaUnavailableError();
  if (isAlwaysMockMode("MESSENGER")) {
    const file = mockFiles.get(attachment.mediaId);
    if (!file) throw new MediaUnavailableError();
    return file;
  }
  const token = getAuthSession()?.accessToken;
  const response = await fetch(`${API}/media/${encodeURIComponent(attachment.mediaId)}/content`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (response.status === 410 || response.status === 404) throw new MediaUnavailableError();
  if (!response.ok) throw new Error(i18n.t("services:messenger.downloadAttachment"), { cause: new HttpResponseError(response.status, "HTTP_ERROR") });
  return response.blob();
}
