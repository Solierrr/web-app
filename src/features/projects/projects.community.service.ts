import i18n from "@/config/i18n/internationalization";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import { getHttpStatus, httpJson } from "@/lib/shared/http/http.service";
import type { ConversationDto, RejectedParticipant } from "@/features/messages/messages.messenger.api";
import {
  addMockCommunityMembers,
  getMockCommunity,
  getMockSubgroups,
  removeMockCommunityMember,
  setMockCommunityStatus,
} from "./projects.community.d.mocks";

const base = `${import.meta.env.VITE_API_MESSENGER?.replace(/\/$/, "")}/messaging/communities`;
const options = (operation: string) => ({ service: "messenger", operation, errorMessage: i18n.t(`services:messenger.${operation}`) });

export type CommunityRole = "OWNER" | "ADMIN" | "MEMBER";
export type CommunityStatus = "ACTIVE" | "ARCHIVED";

export interface CommunityMember {
  userId: string;
  role: CommunityRole;
  joinedAt: string;
}

export interface Community {
  id: string;
  projectId: string;
  members: CommunityMember[];
  status: CommunityStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  /** Só vem ao adicionar membros: quem o servidor recusou. */
  rejectedParticipants?: RejectedParticipant[];
}

/** Quem assume a gestão de um subgrupo quando o gestor atual sai da comunidade. */
export interface Successor {
  conversationId: string;
  successorUserId: string;
}

/** `null` quando o projeto ainda não tem comunidade (404). */
export async function getProjectCommunity(projectId: string): Promise<Community | null> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return getMockCommunity(projectId);
  }
  try {
    return await httpJson<Community>(`${base}/project/${encodeURIComponent(projectId)}`, options("getProjectCommunity"));
  } catch (error) {
    if (getHttpStatus(error) === 404) return null;
    throw error;
  }
}

/** Só o demandante do projeto cria; quem criou vira OWNER. */
export function createProjectCommunity(projectId: string): Promise<Community> {
  return httpJson<Community>(base, { ...options("createProjectCommunity"), method: "POST", body: { projectId } });
}

/** OWNER e ADMIN veem todos os subgrupos; o membro comum só os dele. */
export async function listCommunitySubgroups(community: Community): Promise<ConversationDto[]> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return getMockSubgroups(community.id);
  }
  return httpJson<ConversationDto[]>(`${base}/${encodeURIComponent(community.id)}/conversations`, options("listCommunitySubgroups"));
}

/** Arquivar deixa os subgrupos só para leitura; reativar os libera. */
export async function setCommunityStatus(id: string, status: CommunityStatus): Promise<Community> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return setMockCommunityStatus(id, status);
  }
  return httpJson<Community>(`${base}/${encodeURIComponent(id)}`, { ...options("setCommunityStatus"), method: "PATCH", body: { status } });
}

/** Quem já é membro só troca de papel: conceder ou tirar ADMIN é do OWNER. */
export async function addCommunityMembers(id: string, userIds: string[], role: Exclude<CommunityRole, "OWNER"> = "MEMBER"): Promise<Community> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return addMockCommunityMembers(id, userIds, role);
  }
  return httpJson<Community>(`${base}/${encodeURIComponent(id)}/members`, { ...options("addCommunityMembers"), method: "POST", body: { userIds, role } });
}

/** Repetir o pedido depois de um 503 `REMOVAL_INCOMPLETE` continua de onde a remoção parou. */
export async function removeCommunityMember(id: string, userId: string, successors: Successor[] = []): Promise<void> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return removeMockCommunityMember(id, userId, successors);
  }
  await httpJson<unknown>(`${base}/${encodeURIComponent(id)}/members/${encodeURIComponent(userId)}`, {
    ...options("removeCommunityMember"),
    method: "DELETE",
    body: successors.length > 0 ? { successors } : undefined,
  });
}
