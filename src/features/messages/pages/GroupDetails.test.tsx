import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GroupDetails from "./GroupDetails";
import * as api from "@/features/messages/messages.messenger.api";
import * as groups from "@/features/messages/messages.messenger.groups";

vi.mock("@/features/messages/messages.messenger.api", () => ({ getConversation: vi.fn(), getMessengerContacts: vi.fn() }));
vi.mock("@/features/messages/messages.messenger.groups", () => ({
  addGroupParticipants: vi.fn(),
  removeGroupParticipant: vi.fn(),
  transferGroupManager: vi.fn(),
}));

const group = (extra: Partial<api.ConversationDto> = {}): api.ConversationDto => ({
  id: "g1",
  conversationType: "GROUP",
  participantIds: ["me", "ana", "bruno"],
  managerUserId: "me",
  title: "Equipe",
  lastInteractionAt: null,
  ...extra,
});
const names = { ana: "Ana", bruno: "Bruno" };

function renderDetails(conversation = group(), userId = "me") {
  const handlers = { onChanged: vi.fn(), onLeft: vi.fn(), onClose: vi.fn() };
  render(<GroupDetails conversation={conversation} userId={userId} names={names} {...handlers} />);
  return handlers;
}

describe("GroupDetails", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.getConversation).mockResolvedValue(group());
    vi.mocked(api.getMessengerContacts).mockResolvedValue([
      { authId: "ana", username: "Ana", avatar: null },
      { authId: "carla", username: "Carla", avatar: null },
    ]);
  });

  it("lists the participants with their names and marks the manager and the user", () => {
    renderDetails();
    const list = screen.getByRole("list", { name: "Participantes" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(within(list).getByText("Você")).toBeInTheDocument();
    expect(within(list).getByText("Ana")).toBeInTheDocument();
    expect(within(list).getByText("Gestor")).toBeInTheDocument();
  });

  it("shows no management action to someone who is not the manager", () => {
    renderDetails(group({ managerUserId: "ana" }));
    expect(screen.queryByRole("button", { name: "Adicionar participantes" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Remover/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Tornar .* gestor/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sair do grupo" })).toBeInTheDocument();
  });

  it("removes a participant after confirmation and reports the new group", async () => {
    vi.mocked(groups.removeGroupParticipant).mockResolvedValue(undefined);
    vi.mocked(api.getConversation).mockResolvedValue(group({ participantIds: ["me", "bruno"] }));
    const { onChanged } = renderDetails();
    fireEvent.click(screen.getByRole("button", { name: "Remover Ana" }));
    fireEvent.click(await screen.findByRole("button", { name: /confirmar/i }));
    await waitFor(() => expect(groups.removeGroupParticipant).toHaveBeenCalledWith("g1", "ana", undefined));
    await waitFor(() => expect(onChanged).toHaveBeenCalledWith(expect.objectContaining({ participantIds: ["me", "bruno"] })));
  });

  it("hands the management to another participant", async () => {
    vi.mocked(groups.transferGroupManager).mockResolvedValue("ana");
    vi.mocked(api.getConversation).mockResolvedValue(group({ managerUserId: "ana" }));
    const { onChanged } = renderDetails();
    fireEvent.click(screen.getByRole("button", { name: "Tornar Ana gestor" }));
    await waitFor(() => expect(groups.transferGroupManager).toHaveBeenCalledWith("g1", "ana"));
    await waitFor(() => expect(onChanged).toHaveBeenCalledWith(expect.objectContaining({ managerUserId: "ana" })));
  });

  it("adds people from the connections who are not in the group yet and warns about the refused ones", async () => {
    vi.mocked(groups.addGroupParticipants).mockResolvedValue({
      conversation: group({ participantIds: ["me", "ana", "bruno", "carla"] }),
      rejectedParticipants: [{ userId: "dora", reasonCode: "NOT_COMMUNITY_MEMBER" }],
    });
    const { onChanged } = renderDetails();
    fireEvent.click(screen.getByRole("button", { name: "Adicionar participantes" }));
    expect(await screen.findByLabelText("Carla")).toBeInTheDocument();
    expect(screen.queryByLabelText("Ana")).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Carla"));
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    await waitFor(() => expect(groups.addGroupParticipants).toHaveBeenCalledWith("g1", ["carla"]));
    expect(await screen.findByText("1 pessoa não pôde ser adicionada.")).toBeInTheDocument();
    expect(onChanged).toHaveBeenCalledWith(expect.objectContaining({ participantIds: ["me", "ana", "bruno", "carla"] }));
  });

  it("offers only the given candidates, without asking for the connections, in a community subgroup", async () => {
    vi.mocked(groups.addGroupParticipants).mockResolvedValue({ conversation: group({ participantIds: ["me", "ana", "bruno", "dora"] }), rejectedParticipants: [] });
    render(
      <GroupDetails
        conversation={group({ communityId: "c1" })}
        userId="me"
        names={names}
        candidates={[{ id: "ana", name: "Ana" }, { id: "dora", name: "Dora" }]}
        onChanged={vi.fn()}
        onLeft={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Adicionar participantes" }));
    expect(await screen.findByLabelText("Dora")).toBeInTheDocument();
    expect(screen.queryByLabelText("Ana")).not.toBeInTheDocument();
    expect(api.getMessengerContacts).not.toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText("Dora"));
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    await waitFor(() => expect(groups.addGroupParticipants).toHaveBeenCalledWith("g1", ["dora"]));
  });

  it("makes the leaving manager choose a successor first", async () => {
    vi.mocked(groups.removeGroupParticipant).mockResolvedValue(undefined);
    const { onLeft } = renderDetails();
    fireEvent.click(screen.getByRole("button", { name: "Sair do grupo" }));
    const confirm = await screen.findByRole("button", { name: /confirmar/i });
    expect(confirm).toBeDisabled();
    fireEvent.click(screen.getByLabelText("Bruno"));
    expect(confirm).toBeEnabled();
    fireEvent.click(confirm);
    await waitFor(() => expect(groups.removeGroupParticipant).toHaveBeenCalledWith("g1", "me", "bruno"));
    await waitFor(() => expect(onLeft).toHaveBeenCalled());
  });

  it("lets a participant leave without a successor", async () => {
    vi.mocked(groups.removeGroupParticipant).mockResolvedValue(undefined);
    const { onLeft } = renderDetails(group({ managerUserId: "ana" }));
    fireEvent.click(screen.getByRole("button", { name: "Sair do grupo" }));
    fireEvent.click(await screen.findByRole("button", { name: /confirmar/i }));
    await waitFor(() => expect(groups.removeGroupParticipant).toHaveBeenCalledWith("g1", "me", undefined));
    await waitFor(() => expect(onLeft).toHaveBeenCalled());
  });

  it("shows the reason when the server refuses the change", async () => {
    vi.mocked(groups.transferGroupManager).mockRejectedValue(new Error("Esse participante não pode assumir a gestão."));
    renderDetails();
    fireEvent.click(screen.getByRole("button", { name: "Tornar Ana gestor" }));
    expect(await screen.findByText("Esse participante não pode assumir a gestão.")).toBeInTheDocument();
  });
});
