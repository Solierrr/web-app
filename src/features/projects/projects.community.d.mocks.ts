import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { getMockMessenger, mockHttpError, putMockConversation } from "@/features/messages/messages.messenger.d.mocks";
import type { ConversationDto } from "@/features/messages/messages.messenger.api";
import { projectApi } from "./projects.service";
import type { Community, CommunityRole, CommunityStatus, Successor } from "./projects.community.service";

// A comunidade simulada é uma só para todos os usuários do navegador, como a do servidor; o id dela é o do projeto.
const KEY = "solaria.mock.communities";

function readAll(): Record<string, Community> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

function save(community: Community): Community {
  localStorage.setItem(KEY, JSON.stringify({ ...readAll(), [community.id]: community }));
  return community;
}

function me(): string {
  return getAuthSession()?.userId ?? "mock-user";
}

/** Primeira leitura: monta a comunidade com a equipe do projeto (dono é OWNER, gerente vira ADMIN, o resto é MEMBER). */
export async function getMockCommunity(projectId: string): Promise<Community> {
  const known = readAll()[projectId];
  if (known) return known;
  const team = await projectApi.members(projectId);
  const now = new Date().toISOString();
  const owner = team.find((member) => member.role === "OWNER")?.authId ?? me();
  return save({
    id: projectId,
    projectId,
    status: "ACTIVE",
    createdBy: owner,
    createdAt: now,
    updatedAt: now,
    members: team.map((member) => ({
      userId: member.authId,
      role: member.role === "OWNER" ? "OWNER" : member.role === "MANAGER" ? "ADMIN" : "MEMBER",
      joinedAt: now,
    })),
  });
}

function roleOf(community: Community, userId: string): CommunityRole | undefined {
  return community.members.find((member) => member.userId === userId)?.role;
}

function requireAdmin(community: Community): CommunityRole {
  const role = roleOf(community, me());
  if (role !== "OWNER" && role !== "ADMIN") throw mockHttpError(403, "UNAUTHORIZED_ACCESS");
  return role;
}

/** Todos os subgrupos da comunidade, como o gestor os vê. */
export function getMockSubgroups(communityId: string): ConversationDto[] {
  return getMockMessenger().conversations.filter((item) => item.communityId === communityId);
}

export async function setMockCommunityStatus(id: string, status: CommunityStatus): Promise<Community> {
  const community = await getMockCommunity(id);
  requireAdmin(community);
  getMockSubgroups(id).forEach((group) => putMockConversation({ ...group, communityStatus: status }));
  return save({ ...community, status, updatedAt: new Date().toISOString() });
}

export async function addMockCommunityMembers(id: string, userIds: string[], role: Exclude<CommunityRole, "OWNER">): Promise<Community> {
  const community = await getMockCommunity(id);
  const actor = requireAdmin(community);
  if (community.status === "ARCHIVED") throw mockHttpError(422, "BUSINESS_RULE_VIOLATION");
  const touchesAdmin = role === "ADMIN" || userIds.some((userId) => roleOf(community, userId) === "ADMIN");
  if (touchesAdmin && actor !== "OWNER") throw mockHttpError(403, "UNAUTHORIZED_ACCESS");
  const now = new Date().toISOString();
  const members = community.members.map((member) => (userIds.includes(member.userId) && member.role !== "OWNER" ? { ...member, role } : member));
  userIds.filter((userId) => !roleOf(community, userId)).forEach((userId) => members.push({ userId, role, joinedAt: now }));
  return { ...save({ ...community, members, updatedAt: now }), rejectedParticipants: [] };
}

/** Sair é livre; o OWNER remove qualquer um e o ADMIN só MEMBER. Cada subgrupo que o alvo gere com outros dentro pede um sucessor que participe dele. */
export async function removeMockCommunityMember(id: string, userId: string, successors: Successor[]): Promise<void> {
  const community = await getMockCommunity(id);
  const actor = roleOf(community, me());
  const target = roleOf(community, userId);
  if (target === "OWNER") throw mockHttpError(422, "BUSINESS_RULE_VIOLATION");
  if (userId !== me() && actor !== "OWNER" && !(actor === "ADMIN" && target === "MEMBER")) throw mockHttpError(403, "UNAUTHORIZED_ACCESS");
  const groups = getMockSubgroups(id).filter((group) => group.participantIds.includes(userId));
  const next = groups.map((group) => {
    const remaining = group.participantIds.filter((participant) => participant !== userId);
    if (group.managerUserId !== userId || remaining.length === 0) return { ...group, participantIds: remaining };
    const successor = successors.find((item) => item.conversationId === group.id)?.successorUserId;
    if (!successor) throw mockHttpError(409, "SUCCESSOR_REQUIRED");
    if (!remaining.includes(successor)) throw mockHttpError(409, "SUCCESSOR_INELIGIBLE");
    return { ...group, participantIds: remaining, managerUserId: successor };
  });
  next.forEach(putMockConversation);
  save({ ...community, members: community.members.filter((member) => member.userId !== userId), updatedAt: new Date().toISOString() });
}
