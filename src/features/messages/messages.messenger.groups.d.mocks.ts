import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import type { ConversationDto } from "./messages.messenger.api";
import { deleteMockConversation, getMockConversation, mockHttpError, putMockConversation } from "./messages.messenger.d.mocks";
import type { GroupResult } from "./messages.messenger.groups";

function me(): string {
  return getAuthSession()?.userId ?? "mock-user";
}

/** Grupo avulso simulado: quem cria é o gestor, como no servidor. */
export function createMockGroup(title: string, participantIds: string[]): GroupResult {
  const conversation: ConversationDto = {
    id: crypto.randomUUID(),
    conversationType: "GROUP",
    participantIds: [me(), ...new Set(participantIds.filter((id) => id !== me()))],
    managerUserId: me(),
    title,
    lastInteractionAt: new Date().toISOString(),
    unreadCount: 0,
  };
  return { conversation: putMockConversation(conversation), rejectedParticipants: [] };
}

function managedGroup(id: string): ConversationDto {
  const conversation = getMockConversation(id);
  if (conversation.conversationType !== "GROUP") throw mockHttpError(422, "BUSINESS_RULE_VIOLATION");
  return conversation;
}

export function addMockParticipants(id: string, userIds: string[]): GroupResult {
  const conversation = managedGroup(id);
  if (conversation.managerUserId !== me()) throw mockHttpError(403, "UNAUTHORIZED_ACCESS");
  const participantIds = [...new Set([...conversation.participantIds, ...userIds])];
  return { conversation: putMockConversation({ ...conversation, participantIds }), rejectedParticipants: [] };
}

export function transferMockManager(id: string, successorUserId: string): string {
  const conversation = managedGroup(id);
  if (conversation.managerUserId !== me()) throw mockHttpError(403, "UNAUTHORIZED_ACCESS");
  if (!conversation.participantIds.includes(successorUserId)) throw mockHttpError(409, "SUCCESSOR_INELIGIBLE");
  putMockConversation({ ...conversation, managerUserId: successorUserId });
  return successorUserId;
}

/** Sair é livre; o gestor que sai de um grupo com outros precisa de sucessor participante. */
export function removeMockParticipant(id: string, userId: string, successorUserId?: string): void {
  const conversation = managedGroup(id);
  const manager = conversation.managerUserId;
  if (userId !== me() && manager !== me()) throw mockHttpError(403, "UNAUTHORIZED_ACCESS");
  const remaining = conversation.participantIds.filter((participant) => participant !== userId);
  let nextManager = manager;
  if (userId === manager && remaining.length > 0) {
    if (!successorUserId) throw mockHttpError(409, "SUCCESSOR_REQUIRED");
    if (!remaining.includes(successorUserId)) throw mockHttpError(409, "SUCCESSOR_INELIGIBLE");
    nextManager = successorUserId;
  }
  // o armazenamento simulado é o da própria pessoa: quem sai deixa de ver o grupo
  if (userId === me() || remaining.length === 0) deleteMockConversation(id);
  else putMockConversation({ ...conversation, participantIds: remaining, managerUserId: nextManager });
}
