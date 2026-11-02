import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import { getHttpStatus, httpJson } from "@/lib/shared/http/http.service";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { getMockMessenger, saveMockProjectConversation } from "@/features/messages/messages.messenger.d.mocks";
import type { ConversationDto } from "@/features/messages/messages.messenger.api";
import type { Project } from "./projects.d";
import { projectApi } from "./projects.service";
const base = `${import.meta.env.VITE_API_MESSENGER?.replace(/\/$/, "")}/messaging/communities`;
const options = { service: "messenger", operation: "projectConversations", errorMessage: "Unable to connect to Messenger" };
export interface RejectedParticipant {
  userId: string;
  reasonCode: string;
}
/** `communityId` nulo: o projeto ainda não tem comunidade e o usuário não é o demandante para criá-la. */
export interface ProjectConversationsResult {
  communityId: string | null;
  conversations: ConversationDto[];
}
export interface CreatedProjectConversation {
  conversation: ConversationDto;
  rejectedParticipants: RejectedParticipant[];
}
async function findCommunity(projectId: string): Promise<{ id: string } | null> {
  try {
    return await httpJson<{ id: string }>(`${base}/project/${projectId}`, options);
  } catch (error) {
    if (getHttpStatus(error) === 404) return null;
    throw error;
  }
}
export async function projectConversations(project: Project): Promise<ProjectConversationsResult> {
  if (isAlwaysMockMode("MESSENGER")) {
    await projectApi.detail(project.id);
    const userId = getAuthSession()?.userId;
    return {
      communityId: project.id,
      conversations: getMockMessenger().conversations.filter((c) => c.communityId === project.id && c.participantIds.includes(userId ?? "")),
    };
  }
  if (isAlwaysMockMode()) throw new Error("Use consistent CORE and MESSENGER mock configuration.");
  // Só o demandante (dono) cria a comunidade; quem não é dono e chega antes dela existir vê o estado vazio.
  const community =
    (await findCommunity(project.id)) ??
    (project.role === "OWNER" ? await httpJson<{ id: string }>(base, { ...options, method: "POST", body: { projectId: project.id } }) : null);
  if (!community) return { communityId: null, conversations: [] };
  const conversations = await httpJson<ConversationDto[]>(`${base}/${community.id}/conversations`, options);
  return { communityId: community.id, conversations };
}
export async function createProjectConversation(
  project: Project,
  communityId: string,
  title: string,
  participantIds: string[],
): Promise<CreatedProjectConversation> {
  if (isAlwaysMockMode("MESSENGER")) {
    const current = await projectApi.detail(project.id);
    if (!current.canContribute) throw new Error("Project is read only");
    const members = await projectApi.members(project.id);
    if (
      participantIds.length < 2 ||
      !participantIds.includes(getAuthSession()?.userId ?? "") ||
      participantIds.some((id) => !members.some((m) => m.authId === id))
    )
      throw new Error("Invalid participants");
    const conversation = saveMockProjectConversation({
      id: crypto.randomUUID(),
      communityId,
      conversationType: "GROUP",
      title,
      participantIds,
      lastInteractionAt: null,
    });
    return { conversation, rejectedParticipants: [] };
  }
  const created = await httpJson<{ conversation: ConversationDto; rejectedParticipants?: RejectedParticipant[] }>(
    `${base}/${communityId}/conversations`,
    { ...options, method: "POST", body: { title, participantIds } },
  );
  return { conversation: created.conversation, rejectedParticipants: created.rejectedParticipants ?? [] };
}
