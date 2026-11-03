import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProjectConversations from "./ProjectConversations";
import { projectConversations } from "../projects.messenger.service";
import { projectApi } from "../projects.service";
import type { Community } from "../projects.community.service";
import type { Project } from "../projects.d";

vi.mock("../projects.messenger.service", () => ({ projectConversations: vi.fn(), createProjectConversation: vi.fn() }));
vi.mock("../projects.service", () => ({ projectApi: { members: vi.fn() } }));
vi.mock("../projects.community.service", () => ({}));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => ({ userId: "me" }) }));
vi.mock("@/features/messages/pages/Chat", () => ({
  Conversation: (props: { readOnly?: boolean; groupCandidates?: { id: string }[] }) => (
    <div data-testid="chat" data-readonly={String(!!props.readOnly)} data-candidates={props.groupCandidates?.map((person) => person.id).join(",")} />
  ),
}));
vi.mock("./ProjectCommunity", () => ({ default: () => <div role="dialog">gestão da comunidade</div> }));

const project = { id: "p1", name: "Obra", role: "OWNER", canManage: true, canContribute: true } as Project;
const community = (status: Community["status"]): Community => ({
  id: "c1",
  projectId: "p1",
  status,
  createdBy: "me",
  createdAt: "x",
  updatedAt: "x",
  members: [
    { userId: "me", role: "OWNER", joinedAt: "x" },
    { userId: "ana", role: "MEMBER", joinedAt: "x" },
  ],
});

function renderConversations(status: Community["status"]) {
  vi.mocked(projectConversations).mockResolvedValue({
    community: community(status),
    conversations: [{ id: "s1", conversationType: "GROUP", participantIds: ["me"], title: "Equipe", lastInteractionAt: null }],
  });
  render(
    <MemoryRouter>
      <ProjectConversations project={project} />
    </MemoryRouter>,
  );
}

describe("ProjectConversations", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(projectApi.members).mockResolvedValue([
      { id: "1", userId: "1", authId: "me", name: "Eu", role: "OWNER", functionName: null },
      { id: "2", userId: "2", authId: "ana", name: "Ana", role: "MEMBER", functionName: null },
      { id: "3", userId: "3", authId: "bruno", name: "Bruno", role: "MEMBER", functionName: null },
    ]);
  });

  it("lets people write while the community is active and offers the subgroup candidates from the community", async () => {
    renderConversations("ACTIVE");
    const chat = await screen.findByTestId("chat");
    expect(chat).toHaveAttribute("data-readonly", "false");
    expect(chat).toHaveAttribute("data-candidates", "me,ana");
    expect(screen.getByRole("button", { name: "Nova conversa" })).toBeInTheDocument();
  });

  it("makes the subgroups read-only and hides new conversations while the community is archived", async () => {
    renderConversations("ARCHIVED");
    expect(await screen.findByTestId("chat")).toHaveAttribute("data-readonly", "true");
    expect(screen.queryByRole("button", { name: "Nova conversa" })).not.toBeInTheDocument();
  });

  it("opens the community management", async () => {
    renderConversations("ACTIVE");
    await screen.findByTestId("chat");
    fireEvent.click(screen.getByRole("button", { name: "Comunidade" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("gestão da comunidade");
  });
});
