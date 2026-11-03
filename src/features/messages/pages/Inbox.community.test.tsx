import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Inbox from "./Inbox";
import * as api from "@/features/messages/messages.messenger.api";

vi.mock("@/features/messages/messages.messenger.api", () => ({
  getConversations: vi.fn(),
  getUserSummary: vi.fn(),
  getMessengerContacts: vi.fn(),
}));
vi.mock("@/features/messages/messages.messenger.groups", () => ({ createGroupConversation: vi.fn() }));
// O useSyncExternalStore exige o mesmo objeto enquanto o estado não muda.
const connection = { status: "connected", attempts: 0 };
vi.mock("@/features/messages/messages.messenger.socket", () => ({
  subscribeToUserEvents: vi.fn(() => () => undefined),
  subscribeToConnection: () => () => undefined,
  getConnectionState: () => connection,
}));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => ({ userId: "me" }) }));
vi.mock("@@/layout/access/canvas/SideCanvas", () => ({ default: () => null }));
vi.mock("@/lib/shared/context/ActiveContext", () => ({ useActiveContext: () => ({ kind: "personal", company: null }) }));
vi.mock("@/features/messages/messages.assistant.service", () => ({ startAssistantConversation: vi.fn() }));
vi.mock("./Chat", () => ({ Conversation: (props: { readOnly?: boolean }) => <p>chat {props.readOnly ? "somente leitura" : "livre"}</p> }));

const subgroup = (communityStatus: "ACTIVE" | "ARCHIVED"): api.ConversationDto => ({
  id: "s1",
  conversationType: "GROUP",
  participantIds: ["me", "ana"],
  title: "Obra",
  communityId: "c1",
  communityStatus,
  lastInteractionAt: "2026-11-01T10:00:00Z",
});

function renderOpened() {
  render(
    <MemoryRouter initialEntries={["/pt-BR/mensagens/s1"]}>
      <Routes>
        <Route path="/:lang/mensagens/:conversationId" element={<Inbox />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Inbox with a community subgroup", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.getUserSummary).mockResolvedValue({ username: "Ana", avatar: null });
  });

  it("opens the subgroup of an archived community read-only", async () => {
    vi.mocked(api.getConversations).mockResolvedValue([subgroup("ARCHIVED")]);
    renderOpened();
    expect(await screen.findByText("chat somente leitura")).toBeInTheDocument();
  });

  it("keeps the subgroup of an active community open for writing", async () => {
    vi.mocked(api.getConversations).mockResolvedValue([subgroup("ACTIVE")]);
    renderOpened();
    await waitFor(() => expect(api.getConversations).toHaveBeenCalled());
    expect(await screen.findByText("chat livre")).toBeInTheDocument();
  });
});
