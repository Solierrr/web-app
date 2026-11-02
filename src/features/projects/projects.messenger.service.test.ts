import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  detail: vi.fn(),
  members: vi.fn(),
  save: vi.fn(),
  http: vi.fn(),
  mock: true,
  conversations: [] as { id: string; communityId: string; participantIds: string[] }[],
}));
vi.mock("@/config/mocks/mockMode.utils", () => ({ isAlwaysMockMode: (service?: string) => mocks.mock && service === "MESSENGER" }));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => ({ userId: "auth-1" }) }));
vi.mock("@/lib/shared/http/http.service", () => ({
  httpJson: mocks.http,
  getHttpStatus: (error: { status?: number }) => error.status ?? null,
}));
vi.mock("./projects.service", () => ({ projectApi: { detail: mocks.detail, members: mocks.members } }));
vi.mock("@/features/messages/messages.messenger.d.mocks", () => ({
  getMockMessenger: () => ({ conversations: mocks.conversations }),
  saveMockProjectConversation: (conversation: (typeof mocks.conversations)[number]) => {
    mocks.save(conversation);
    mocks.conversations.push(conversation);
    return conversation;
  },
}));
import { createProjectConversation, projectConversations } from "./projects.messenger.service";
import type { Project } from "./projects.d";
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
const notFound = Object.assign(new Error("not found"), { status: 404 });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.conversations.length = 0;
  mocks.mock = true;
});
describe("project conversations with a local Messenger", () => {
  it("validates the real project and lists only the conversations of the user, without a general conversation", async () => {
    mocks.detail.mockResolvedValue(project);
    mocks.conversations.push(
      { id: "mine", communityId: "real-project", participantIds: ["auth-1", "auth-2"] },
      { id: "others", communityId: "real-project", participantIds: ["auth-2"] },
    );
    const result = await projectConversations(project);
    expect(mocks.detail).toHaveBeenCalledWith("real-project");
    expect(result.communityId).toBe("real-project");
    expect(result.conversations.map((c) => c.id)).toEqual(["mine"]);
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("does not create mock conversation data when Core denies project access", async () => {
    mocks.detail.mockRejectedValue(new Error("Access denied"));
    await expect(projectConversations(project)).rejects.toThrow("Access denied");
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("creates a group and returns it with no rejected participants", async () => {
    mocks.detail.mockResolvedValue(project);
    mocks.members.mockResolvedValue([{ authId: "auth-1" }, { authId: "auth-2" }]);
    const created = await createProjectConversation(project, "real-project", "Equipe", ["auth-1", "auth-2"]);
    expect(created.conversation).toMatchObject({ communityId: "real-project", title: "Equipe", participantIds: ["auth-1", "auth-2"] });
    expect(created.conversation).not.toHaveProperty("projectGeneral");
    expect(created.rejectedParticipants).toEqual([]);
  });
});
describe("project conversations with the real Messenger", () => {
  beforeEach(() => {
    mocks.mock = false;
  });
  it("reuses the community that already exists without trying to create it again", async () => {
    mocks.http.mockResolvedValueOnce({ id: "community-1" }).mockResolvedValueOnce([{ id: "conv-1" }]);
    const result = await projectConversations(project);
    expect(mocks.http).toHaveBeenCalledTimes(2);
    expect(mocks.http.mock.calls[0][0]).toMatch(/\/communities\/project\/real-project$/);
    expect(mocks.http.mock.calls[0][1].method).toBeUndefined();
    expect(mocks.http.mock.calls[1][0]).toMatch(/\/communities\/community-1\/conversations$/);
    expect(result).toEqual({ communityId: "community-1", conversations: [{ id: "conv-1" }] });
  });
  it("creates the community only when it does not exist and the user is the project owner", async () => {
    mocks.http.mockRejectedValueOnce(notFound).mockResolvedValueOnce({ id: "community-2" }).mockResolvedValueOnce([]);
    const result = await projectConversations(project);
    expect(mocks.http.mock.calls[1][0]).toMatch(/\/communities$/);
    expect(mocks.http.mock.calls[1][1]).toMatchObject({ method: "POST", body: { projectId: "real-project" } });
    expect(result).toEqual({ communityId: "community-2", conversations: [] });
  });
  it("returns an empty state, without calling the server again, when a non-owner finds no community", async () => {
    mocks.http.mockRejectedValueOnce(notFound);
    const result = await projectConversations({ ...project, role: "MEMBER" });
    expect(mocks.http).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ communityId: null, conversations: [] });
  });
  it("does not hide server errors other than a missing community", async () => {
    mocks.http.mockRejectedValueOnce(Object.assign(new Error("boom"), { status: 500 }));
    await expect(projectConversations(project)).rejects.toThrow("boom");
    expect(mocks.http).toHaveBeenCalledTimes(1);
  });
  it("unwraps the created conversation and reports the participants the server refused", async () => {
    const rejected = [{ userId: "auth-3", reasonCode: "NOT_IN_COMMUNITY" }];
    mocks.http.mockResolvedValueOnce({
      conversation: { id: "conv-9", title: "Equipe" },
      admittedParticipantIds: ["auth-1", "auth-2"],
      rejectedParticipants: rejected,
    });
    const created = await createProjectConversation(project, "community-1", "Equipe", ["auth-1", "auth-2", "auth-3"]);
    expect(mocks.http.mock.calls[0][0]).toMatch(/\/communities\/community-1\/conversations$/);
    expect(mocks.http.mock.calls[0][1]).toMatchObject({ method: "POST", body: { title: "Equipe", participantIds: ["auth-1", "auth-2", "auth-3"] } });
    expect(created).toEqual({ conversation: { id: "conv-9", title: "Equipe" }, rejectedParticipants: rejected });
  });
});
