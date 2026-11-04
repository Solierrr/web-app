import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addGroupParticipants, createGroupConversation, removeGroupParticipant, transferGroupManager } from "./messages.messenger.groups";
import { getConversation, getConversations } from "./messages.messenger.api";

const ME = "0b9c7a4e-6d1f-4c5e-9a43-2f7d8e1b6a10";
const ANA = "7e2a1d90-3b44-4a8e-b3c1-5d6f9a0c2e88";
const BRUNO = "3c5d8f21-9a47-4b10-8e66-1d2f3a4b5c6d";
const CARLA = "9d8c7b6a-5f4e-4d3c-b2a1-0f1e2d3c4b5a";

vi.mock("@/config/logging/logger", () => ({ default: { serviceError: vi.fn(), debug: vi.fn() } }));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({
  getAuthSession: () => ({ userId: ME, accessToken: "test-token", accessTokenExpiresAt: "2999-01-01T00:00:00Z" }),
}));

const group = { id: "g1", conversationType: "GROUP", participantIds: [ME, ANA], managerUserId: ME, title: "Equipe", lastInteractionAt: null };
const fetchMock = vi.fn();
function respond(body: unknown, status = 200) {
  fetchMock.mockResolvedValueOnce(
    new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }),
  );
}

describe("group management through the Messenger API", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_MESSENGER_MOCKS", "DEACTIVATED");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("creates a group and returns the conversation with who was admitted and who was refused", async () => {
    respond({ conversation: group, admittedParticipantIds: [ME, ANA], rejectedParticipants: [{ userId: BRUNO, reasonCode: "USER_INACTIVE" }] }, 201);
    const created = await createGroupConversation("Equipe", [ANA, BRUNO]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/messaging/conversations/group"),
      expect.objectContaining({ method: "POST", body: JSON.stringify({ title: "Equipe", participantIds: [ANA, BRUNO] }) }),
    );
    expect(created.conversation.id).toBe("g1");
    expect(created.rejectedParticipants).toEqual([{ userId: BRUNO, reasonCode: "USER_INACTIVE" }]);
  });

  it("adds participants and keeps the refused ones of the response", async () => {
    respond({ ...group, participantIds: [ME, ANA, BRUNO], rejectedParticipants: [{ userId: CARLA, reasonCode: "NOT_COMMUNITY_MEMBER" }] });
    const result = await addGroupParticipants("g1", [BRUNO, CARLA]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/messaging/conversations/g1/participants"),
      expect.objectContaining({ method: "POST", body: JSON.stringify({ userIds: [BRUNO, CARLA] }) }),
    );
    expect(result.conversation.participantIds).toContain(BRUNO);
    expect(result.rejectedParticipants).toEqual([{ userId: CARLA, reasonCode: "NOT_COMMUNITY_MEMBER" }]);
  });

  it("removes a participant, naming the successor in the query when the manager leaves", async () => {
    respond(null, 204);
    await removeGroupParticipant("g1", ME, ANA);
    expect(fetchMock.mock.calls[0][0]).toContain(`/messaging/conversations/g1/participants/${ME}?successorUserId=${ANA}`);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "DELETE" });
    respond(null, 204);
    await removeGroupParticipant("g1", ANA);
    expect(fetchMock.mock.calls[1][0]).toMatch(new RegExp(`/participants/${ANA}$`));
  });

  it("transfers the management with PUT", async () => {
    respond({ conversationId: "g1", managerUserId: ANA });
    await expect(transferGroupManager("g1", ANA)).resolves.toBe(ANA);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/messaging/conversations/g1/manager"),
      expect.objectContaining({ method: "PUT", body: JSON.stringify({ successorUserId: ANA }) }),
    );
  });

  it("keeps the server error so the screen can explain the 409 about the successor", async () => {
    respond({ errorCode: "SUCCESSOR_REQUIRED" }, 409);
    await expect(removeGroupParticipant("g1", ME)).rejects.toMatchObject({ cause: { status: 409, code: "SUCCESSOR_REQUIRED" } });
  });
});

describe("group management in demonstration mode", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_MESSENGER_MOCKS", "ALWAYS");
    vi.stubEnv("VITE_MOCKS_DELAY_SECONDS", "0");
    localStorage.clear();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("creates a group managed by the creator, then adds and removes people", async () => {
    const { conversation, rejectedParticipants } = await createGroupConversation("Equipe", [ANA]);
    expect(conversation).toMatchObject({ conversationType: "GROUP", managerUserId: ME, title: "Equipe" });
    expect(conversation.participantIds).toEqual([ME, ANA]);
    expect(rejectedParticipants).toEqual([]);
    const added = await addGroupParticipants(conversation.id, [BRUNO]);
    expect(added.conversation.participantIds).toEqual([ME, ANA, BRUNO]);
    await removeGroupParticipant(conversation.id, ANA);
    expect((await getConversation(conversation.id)).participantIds).toEqual([ME, BRUNO]);
  });

  it("demands a successor when the manager leaves a group with others, and lets only the manager manage", async () => {
    const { conversation } = await createGroupConversation("Equipe", [ANA, BRUNO]);
    await expect(removeGroupParticipant(conversation.id, ME)).rejects.toMatchObject({ cause: { status: 409, code: "SUCCESSOR_REQUIRED" } });
    await expect(removeGroupParticipant(conversation.id, ME, CARLA)).rejects.toMatchObject({ cause: { status: 409, code: "SUCCESSOR_INELIGIBLE" } });
    await expect(transferGroupManager(conversation.id, ANA)).resolves.toBe(ANA);
    expect((await getConversation(conversation.id)).managerUserId).toBe(ANA);
    await expect(addGroupParticipants(conversation.id, [CARLA])).rejects.toMatchObject({ cause: { status: 403 } });
    await expect(removeGroupParticipant(conversation.id, BRUNO)).rejects.toMatchObject({ cause: { status: 403 } });
  });

  it("takes the group off the list of whoever leaves it", async () => {
    const { conversation } = await createGroupConversation("Equipe", [ANA]);
    await removeGroupParticipant(conversation.id, ME, ANA);
    expect((await getConversations()).map((item) => item.id)).not.toContain(conversation.id);
  });
});
