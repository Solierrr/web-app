import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addCommunityMembers,
  getProjectCommunity,
  listCommunitySubgroups,
  removeCommunityMember,
  setCommunityStatus,
} from "./projects.community.service";
import { getMockConversation, putMockConversation } from "@/features/messages/messages.messenger.d.mocks";

const ME = "0b9c7a4e-6d1f-4c5e-9a43-2f7d8e1b6a10";
const ANA = "7e2a1d90-3b44-4a8e-b3c1-5d6f9a0c2e88";
const BRUNO = "3c5d8f21-9a47-4b10-8e66-1d2f3a4b5c6d";
const CARLA = "9d8c7b6a-5f4e-4d3c-b2a1-0f1e2d3c4b5a";

const session = vi.hoisted(() => ({ userId: "" }));
const members = vi.hoisted(() => ({ list: vi.fn() }));
vi.mock("@/config/logging/logger", () => ({ default: { serviceError: vi.fn(), debug: vi.fn() } }));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({
  getAuthSession: () => ({ userId: session.userId, accessToken: "test-token", accessTokenExpiresAt: "2999-01-01T00:00:00Z" }),
}));
vi.mock("./projects.service", () => ({ projectApi: { members: members.list } }));

const community = {
  id: "c1",
  projectId: "p1",
  status: "ACTIVE",
  createdBy: ME,
  members: [{ userId: ME, role: "OWNER", joinedAt: "2026-11-01T10:00:00Z" }],
};
const fetchMock = vi.fn();
function respond(body: unknown, status = 200) {
  fetchMock.mockResolvedValueOnce(
    new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }),
  );
}

describe("community management through the Messenger API", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_MESSENGER_MOCKS", "DEACTIVATED");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    session.userId = ME;
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("finds the community of the project and says there is none on a 404", async () => {
    respond(community);
    await expect(getProjectCommunity("p1")).resolves.toMatchObject({ id: "c1", status: "ACTIVE" });
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/messaging\/communities\/project\/p1$/);
    respond({ errorCode: "RESOURCE_NOT_FOUND" }, 404);
    await expect(getProjectCommunity("p2")).resolves.toBeNull();
  });

  it("archives and reactivates with PATCH", async () => {
    respond({ ...community, status: "ARCHIVED" });
    await expect(setCommunityStatus("c1", "ARCHIVED")).resolves.toMatchObject({ status: "ARCHIVED" });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/messaging/communities/c1"),
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ status: "ARCHIVED" }) }),
    );
  });

  it("adds members with a role and keeps who the server refused", async () => {
    respond({ ...community, rejectedParticipants: [{ userId: BRUNO, reasonCode: "USER_INACTIVE" }] });
    const result = await addCommunityMembers("c1", [ANA, BRUNO], "ADMIN");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/messaging/communities/c1/members"),
      expect.objectContaining({ method: "POST", body: JSON.stringify({ userIds: [ANA, BRUNO], role: "ADMIN" }) }),
    );
    expect(result.rejectedParticipants).toEqual([{ userId: BRUNO, reasonCode: "USER_INACTIVE" }]);
  });

  it("removes a member sending the successors only when there are some", async () => {
    respond(null, 204);
    await removeCommunityMember("c1", ANA);
    expect(fetchMock.mock.calls[0][0]).toMatch(new RegExp(`/communities/c1/members/${ANA}$`));
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "DELETE", body: undefined });
    respond(null, 204);
    const successors = [{ conversationId: "s1", successorUserId: BRUNO }];
    await removeCommunityMember("c1", ANA, successors);
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: "DELETE", body: JSON.stringify({ successors }) });
  });

  it("keeps the 409 and 503 codes so the screen can ask for a successor or repeat the removal", async () => {
    respond({ errorCode: "SUCCESSOR_REQUIRED" }, 409);
    await expect(removeCommunityMember("c1", ANA)).rejects.toMatchObject({ cause: { status: 409, code: "SUCCESSOR_REQUIRED" } });
    respond({ errorCode: "REMOVAL_INCOMPLETE" }, 503);
    await expect(removeCommunityMember("c1", ANA)).rejects.toMatchObject({ cause: { status: 503, code: "REMOVAL_INCOMPLETE" } });
  });
});

describe("community management in demonstration mode", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_MESSENGER_MOCKS", "ALWAYS");
    vi.stubEnv("VITE_MOCKS_DELAY_SECONDS", "0");
    localStorage.clear();
    session.userId = ME;
    members.list.mockResolvedValue([
      { authId: ME, role: "OWNER" },
      { authId: ANA, role: "MANAGER" },
      { authId: BRUNO, role: "MEMBER" },
      { authId: CARLA, role: "VIEWER" },
    ]);
    putMockConversation({
      id: "s1",
      conversationType: "GROUP",
      communityId: "p1",
      communityStatus: "ACTIVE",
      participantIds: [ME, BRUNO, ANA],
      managerUserId: BRUNO,
      title: "Obra",
      lastInteractionAt: null,
    });
  });
  afterEach(() => vi.unstubAllEnvs());

  it("starts from the project team: the owner owns, managers administer and the rest are members", async () => {
    const found = await getProjectCommunity("p1");
    expect(found).toMatchObject({ id: "p1", status: "ACTIVE" });
    expect(found?.members.map(({ userId, role }) => [userId, role])).toEqual([
      [ME, "OWNER"],
      [ANA, "ADMIN"],
      [BRUNO, "MEMBER"],
      [CARLA, "MEMBER"],
    ]);
  });

  it("archives the community and its subgroups, then reactivates them", async () => {
    await setCommunityStatus("p1", "ARCHIVED");
    expect((await getProjectCommunity("p1"))?.status).toBe("ARCHIVED");
    expect(getMockConversation("s1").communityStatus).toBe("ARCHIVED");
    await expect(addCommunityMembers("p1", [CARLA])).rejects.toMatchObject({ cause: { status: 422, code: "BUSINESS_RULE_VIOLATION" } });
    await setCommunityStatus("p1", "ACTIVE");
    expect(getMockConversation("s1").communityStatus).toBe("ACTIVE");
  });

  it("lets only the owner grant or take away the admin role", async () => {
    await expect(addCommunityMembers("p1", [BRUNO], "ADMIN")).resolves.toBeDefined();
    expect((await getProjectCommunity("p1"))?.members.find((m) => m.userId === BRUNO)?.role).toBe("ADMIN");
    await addCommunityMembers("p1", [BRUNO], "MEMBER");
    expect((await getProjectCommunity("p1"))?.members.find((m) => m.userId === BRUNO)?.role).toBe("MEMBER");
    session.userId = ANA;
    await expect(addCommunityMembers("p1", [BRUNO], "ADMIN")).rejects.toMatchObject({ cause: { status: 403 } });
  });

  it("asks for a successor in each subgroup the removed person manages, and checks the choice", async () => {
    await expect(removeCommunityMember("p1", BRUNO)).rejects.toMatchObject({ cause: { status: 409, code: "SUCCESSOR_REQUIRED" } });
    await expect(removeCommunityMember("p1", BRUNO, [{ conversationId: "s1", successorUserId: CARLA }])).rejects.toMatchObject({
      cause: { status: 409, code: "SUCCESSOR_INELIGIBLE" },
    });
    await removeCommunityMember("p1", BRUNO, [{ conversationId: "s1", successorUserId: ANA }]);
    expect(getMockConversation("s1")).toMatchObject({ participantIds: [ME, ANA], managerUserId: ANA });
    expect((await getProjectCommunity("p1"))?.members.map((m) => m.userId)).not.toContain(BRUNO);
  });

  it("never removes the owner and keeps a plain member from removing others", async () => {
    await expect(removeCommunityMember("p1", ME)).rejects.toMatchObject({ cause: { status: 422 } });
    session.userId = CARLA;
    await expect(removeCommunityMember("p1", ANA)).rejects.toMatchObject({ cause: { status: 403 } });
    await expect(removeCommunityMember("p1", CARLA)).resolves.toBeUndefined();
  });

  it("lists every subgroup of the community", async () => {
    const community = await getProjectCommunity("p1");
    expect((await listCommunitySubgroups(community!)).map((group) => group.id)).toEqual(["s1"]);
  });
});
