import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProjectCommunity from "./ProjectCommunity";
import * as service from "../projects.community.service";
import type { Community } from "../projects.community.service";
import type { ProjectMember } from "../projects.d";

vi.mock("../projects.community.service", () => ({
  addCommunityMembers: vi.fn(),
  listCommunitySubgroups: vi.fn(),
  removeCommunityMember: vi.fn(),
  setCommunityStatus: vi.fn(),
}));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => ({ userId: "me" }) }));
vi.mock("@/config/logging/logger", () => ({ default: { serviceError: vi.fn(), debug: vi.fn() } }));

const person = (authId: string, name: string): ProjectMember =>
  ({ id: authId, userId: authId, authId, name, role: "MEMBER", functionName: null }) as ProjectMember;
const people = [person("me", "Eu"), person("ana", "Ana"), person("bruno", "Bruno"), person("carla", "Carla")];
const community = (extra: Partial<Community> = {}): Community => ({
  id: "c1",
  projectId: "p1",
  status: "ACTIVE",
  createdBy: "me",
  createdAt: "2026-11-01T10:00:00Z",
  updatedAt: "2026-11-01T10:00:00Z",
  members: [
    { userId: "me", role: "OWNER", joinedAt: "2026-11-01T10:00:00Z" },
    { userId: "ana", role: "ADMIN", joinedAt: "2026-11-01T10:00:00Z" },
    { userId: "bruno", role: "MEMBER", joinedAt: "2026-11-01T10:00:00Z" },
  ],
  ...extra,
});

function renderDialog(current = community()) {
  const handlers = { onChanged: vi.fn().mockResolvedValue(undefined), onClose: vi.fn() };
  render(
    <MemoryRouter>
      <ProjectCommunity community={current} people={people} {...handlers} />
    </MemoryRouter>,
  );
  return handlers;
}

describe("ProjectCommunity", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(service.listCommunitySubgroups).mockResolvedValue([]);
  });

  it("lists the members with name and role", () => {
    renderDialog();
    const list = screen.getByRole("list", { name: "Membros da comunidade" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(within(list).getByText("Ana")).toBeInTheDocument();
    expect(within(list).getByText("Administrador")).toBeInTheDocument();
    expect(within(list).getByText("Membro")).toBeInTheDocument();
  });

  it("gives a plain member no action besides leaving", () => {
    renderDialog(
      community({
        members: [
          { userId: "me", role: "MEMBER", joinedAt: "x" },
          { userId: "ana", role: "OWNER", joinedAt: "x" },
        ],
      }),
    );
    expect(screen.queryByRole("button", { name: /Remover/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Adicionar membros" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Arquivar comunidade" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sair da comunidade" })).toBeInTheDocument();
  });

  it("lets an admin remove a member but not another admin, and never the owner", () => {
    renderDialog(
      community({
        members: [
          { userId: "me", role: "ADMIN", joinedAt: "x" },
          { userId: "ana", role: "ADMIN", joinedAt: "x" },
          { userId: "bruno", role: "MEMBER", joinedAt: "x" },
          { userId: "carla", role: "OWNER", joinedAt: "x" },
        ],
      }),
    );
    expect(screen.getByRole("button", { name: "Remover Bruno" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remover Ana" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remover Carla" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /administrador/ })).not.toBeInTheDocument();
  });

  it("lets only the owner promote and demote an admin", async () => {
    vi.mocked(service.addCommunityMembers).mockResolvedValue(community());
    const { onChanged } = renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Tornar Bruno administrador" }));
    await waitFor(() => expect(service.addCommunityMembers).toHaveBeenCalledWith("c1", ["bruno"], "ADMIN"));
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Tirar Ana de administrador" }));
    await waitFor(() => expect(service.addCommunityMembers).toHaveBeenCalledWith("c1", ["ana"], "MEMBER"));
  });

  it("adds project people who are not in the community yet and reports who the server refused", async () => {
    vi.mocked(service.addCommunityMembers).mockResolvedValue({
      ...community(),
      rejectedParticipants: [{ userId: "carla", reasonCode: "USER_INACTIVE" }],
    });
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Adicionar membros" }));
    const picker = await screen.findByRole("list", { name: "Selecione as pessoas" });
    expect(within(picker).queryByText("Ana")).not.toBeInTheDocument();
    fireEvent.click(within(picker).getByLabelText("Carla"));
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    await waitFor(() => expect(service.addCommunityMembers).toHaveBeenCalledWith("c1", ["carla"], "MEMBER"));
    expect(await screen.findByRole("status")).toHaveTextContent("1 pessoa");
  });

  it("removes a member who manages no subgroup after one confirmation", async () => {
    vi.mocked(service.removeCommunityMember).mockResolvedValue(undefined);
    const { onChanged } = renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Remover Bruno" }));
    fireEvent.click(await screen.findByRole("button", { name: /confirmar/i }));
    await waitFor(() => expect(service.removeCommunityMember).toHaveBeenCalledWith("c1", "bruno", []));
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
  });

  it("asks for a successor in every subgroup the removed person manages, and only offers its participants", async () => {
    vi.mocked(service.listCommunitySubgroups).mockResolvedValue([
      {
        id: "s1",
        conversationType: "GROUP",
        title: "Obra",
        participantIds: ["bruno", "ana", "carla"],
        managerUserId: "bruno",
        lastInteractionAt: null,
      },
      { id: "s2", conversationType: "GROUP", title: "Compras", participantIds: ["bruno"], managerUserId: "bruno", lastInteractionAt: null },
      { id: "s3", conversationType: "GROUP", title: "Outro", participantIds: ["bruno", "ana"], managerUserId: "ana", lastInteractionAt: null },
    ]);
    vi.mocked(service.removeCommunityMember).mockResolvedValue(undefined);
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Remover Bruno" }));
    const group = await screen.findByRole("group", { name: /Obra/ });
    expect(screen.queryByRole("group", { name: /Compras/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: /Outro/ })).not.toBeInTheDocument();
    expect(within(group).queryByLabelText("Bruno")).not.toBeInTheDocument();
    const confirm = screen.getByRole("button", { name: /confirmar/i });
    expect(confirm).toBeDisabled();
    fireEvent.click(within(group).getByLabelText("Carla"));
    fireEvent.click(confirm);
    await waitFor(() =>
      expect(service.removeCommunityMember).toHaveBeenCalledWith("c1", "bruno", [{ conversationId: "s1", successorUserId: "carla" }]),
    );
  });

  it("keeps the confirmation open with the message when the removal stops halfway, so it can be repeated", async () => {
    vi.mocked(service.removeCommunityMember)
      .mockRejectedValueOnce(new Error("A remoção parou no meio. Tente de novo para continuar de onde parou."))
      .mockResolvedValueOnce(undefined);
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Remover Bruno" }));
    fireEvent.click(await screen.findByRole("button", { name: /confirmar/i }));
    expect(await screen.findByText(/parou no meio/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /confirmar/i }));
    await waitFor(() => expect(service.removeCommunityMember).toHaveBeenCalledTimes(2));
  });

  it("archives after confirmation and offers to reactivate an archived community", async () => {
    vi.mocked(service.setCommunityStatus).mockResolvedValue(community({ status: "ARCHIVED" }));
    const { onChanged } = renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Arquivar comunidade" }));
    fireEvent.click(await screen.findByRole("button", { name: /confirmar/i }));
    await waitFor(() => expect(service.setCommunityStatus).toHaveBeenCalledWith("c1", "ARCHIVED"));
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
  });

  it("explains an archived community: only reactivating and removing remain", () => {
    renderDialog(community({ status: "ARCHIVED" }));
    expect(screen.getByText(/só para leitura/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reativar comunidade" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Adicionar membros" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /administrador/ })).not.toBeInTheDocument();
  });
});
