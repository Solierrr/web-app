import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import { httpJson } from "@/lib/shared/http/http.service";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { getMockMessenger, saveMockProjectConversation } from "@/features/messages/messages.messenger.d.mocks";
import type { ConversationDto } from "@/features/messages/messages.messenger.api";
import type { Project, ProjectMember } from "./projects.d";
import { projectApi } from "./projects.service";
const base = `${import.meta.env.VITE_API_MESSENGER?.replace(/\/$/, "")}/messaging/communities`;
const options = { service: "messenger", operation: "projectConversations", errorMessage: "Unable to connect to Messenger" };
export async function projectConversations(
  project: Project,
  members: ProjectMember[],
): Promise<{ communityId: string; conversations: ConversationDto[] }> {
  if (isAlwaysMockMode("MESSENGER")) {
    await projectApi.detail(project.id);
    const general: ConversationDto = {
      id: `project-general-${project.id}`,
      conversationType: "GROUP",
      communityId: project.id,
      projectGeneral: true,
      title: project.name,
      participantIds: members.map((m) => m.authId),
      lastInteractionAt: null,
    };
    saveMockProjectConversation(general);
    const userId = getAuthSession()?.userId;
    return {
      communityId: project.id,
      conversations: getMockMessenger().conversations.filter(
        (c) => c.communityId === project.id && (c.projectGeneral || c.participantIds.includes(userId ?? "")),
      ),
    };
  }
  if (isAlwaysMockMode()) throw new Error("Use consistent CORE and MESSENGER mock configuration.");
  const community = await httpJson<{ id: string }>(base, { ...options, method: "POST", body: { projectId: project.id } });
  const conversations = await httpJson<ConversationDto[]>(`${base}/${community.id}/conversations`, options);
  return { communityId: community.id, conversations };
}
export async function createProjectConversation(project: Project, communityId: string, title: string, participantIds: string[]) {
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
    return saveMockProjectConversation({
      id: crypto.randomUUID(),
      communityId,
      projectGeneral: false,
      conversationType: "GROUP",
      title,
      participantIds,
      lastInteractionAt: null,
    });
  }
  return httpJson<ConversationDto>(`${base}/${communityId}/conversations`, { ...options, method: "POST", body: { title, participantIds } });
}
