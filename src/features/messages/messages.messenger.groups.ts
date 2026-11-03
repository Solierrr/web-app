import i18n from "@/config/i18n/internationalization";
import { httpJson } from "@/lib/shared/http/http.service";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import type { ConversationDto, RejectedParticipant } from "./messages.messenger.api";
import { addMockParticipants, createMockGroup, removeMockParticipant, transferMockManager } from "./messages.messenger.groups.d.mocks";

const API = `${import.meta.env.VITE_API_MESSENGER?.replace(/\/$/, "")}/messaging/conversations`;
const options = (operation: string) => ({ service: "messenger", operation, errorMessage: i18n.t(`services:messenger.${operation}`) });

export interface GroupResult {
  conversation: ConversationDto;
  rejectedParticipants: RejectedParticipant[];
}

/** Cria um grupo avulso: o criador vira gestor e `participantIds` leva só as outras pessoas. */
export async function createGroupConversation(title: string, participantIds: string[]): Promise<GroupResult> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return createMockGroup(title, participantIds);
  }
  const created = await httpJson<{ conversation: ConversationDto; rejectedParticipants?: RejectedParticipant[] }>(`${API}/group`, {
    ...options("createGroupConversation"),
    method: "POST",
    body: { title, participantIds },
  });
  return { conversation: created.conversation, rejectedParticipants: created.rejectedParticipants ?? [] };
}

/** Só o gestor adiciona; quem o servidor recusar volta em `rejectedParticipants` do próprio grupo. */
export async function addGroupParticipants(id: string, userIds: string[]): Promise<GroupResult> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return addMockParticipants(id, userIds);
  }
  const { rejectedParticipants, ...conversation } = await httpJson<ConversationDto & { rejectedParticipants?: RejectedParticipant[] }>(
    `${API}/${encodeURIComponent(id)}/participants`,
    { ...options("addGroupParticipants"), method: "POST", body: { userIds } },
  );
  return { conversation, rejectedParticipants: rejectedParticipants ?? [] };
}

/** O gestor remove outra pessoa; qualquer um sai sozinho. O gestor que sai de um grupo com outros indica o sucessor. */
export async function removeGroupParticipant(id: string, userId: string, successorUserId?: string): Promise<void> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    removeMockParticipant(id, userId, successorUserId);
    return;
  }
  await httpJson<unknown>(
    `${API}/${encodeURIComponent(id)}/participants/${encodeURIComponent(userId)}${successorUserId ? `?successorUserId=${encodeURIComponent(successorUserId)}` : ""}`,
    { ...options("removeGroupParticipant"), method: "DELETE" },
  );
}

/** Passa a gestão a outro participante e devolve o gestor vigente. */
export async function transferGroupManager(id: string, successorUserId: string): Promise<string> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return transferMockManager(id, successorUserId);
  }
  const result = await httpJson<{ managerUserId: string }>(`${API}/${encodeURIComponent(id)}/manager`, {
    ...options("transferGroupManager"),
    method: "PUT",
    body: { successorUserId },
  });
  return result.managerUserId;
}
