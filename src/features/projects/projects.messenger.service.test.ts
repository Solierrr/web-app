import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  detail: vi.fn(),
  save: vi.fn(),
  conversations: [] as { id: string; communityId: string; participantIds: string[]; projectGeneral: boolean }[],
}));
vi.mock("@/config/mocks/mockMode.utils", () => ({ isAlwaysMockMode: (service?: string) => service === "MESSENGER" }));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => ({ userId: "auth-1" }) }));
vi.mock("./projects.service", () => ({ projectApi: { detail: mocks.detail } }));
vi.mock("@/features/messages/messages.messenger.d.mocks", () => ({
  getMockMessenger: () => ({ conversations: mocks.conversations }),
  saveMockProjectConversation: (conversation: (typeof mocks.conversations)[number]) => {
    mocks.save(conversation);
    mocks.conversations.push(conversation);
    return conversation;
  },
}));
import { projectConversations } from "./projects.messenger.service";
import type { Project, ProjectMember } from "./projects.d";
const project: Project = {
  id: "real-project",
  name: "Projeto real",
  ownerCompanyId: null,
  ownerUserId: "user-1",
  status: "OPEN",
  archived: false,
  role: "OWNER",
  canManage: true,
  canContribute: true,
  createdAt: "2026-10-13T12:00:00Z",
};
const members: ProjectMember[] = [{ id: "member-1", userId: "user-1", authId: "auth-1", name: "Ana", role: "OWNER", functionName: null }];
beforeEach(() => {
  vi.clearAllMocks();
  mocks.conversations.length = 0;
});
describe("project conversations with a local Messenger", () => {
  it("validates the real project before initializing the local general conversation", async () => {
    mocks.detail.mockResolvedValue(project);
    const result = await projectConversations(project, members);
    expect(mocks.detail).toHaveBeenCalledWith("real-project");
    expect(result.communityId).toBe("real-project");
    expect(result.conversations).toHaveLength(1);
    expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ participantIds: ["auth-1"], projectGeneral: true }));
  });
  it("does not create mock conversation data when Core denies project access", async () => {
    mocks.detail.mockRejectedValue(new Error("Access denied"));
    await expect(projectConversations(project, members)).rejects.toThrow("Access denied");
    expect(mocks.save).not.toHaveBeenCalled();
  });
});
