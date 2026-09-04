import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Chat from "./Chat";

vi.mock("@/features/messages/messages.service", () => ({
  getMessages: vi.fn(),
  sendMessage: vi.fn(),
}));

vi.mock("@/config/firebase/useTypingStatus", () => ({
  useTypingStatus: () => ({
    notifyTyping: vi.fn(),
    stopTyping: vi.fn(),
    typingUserIds: [],
  }),
}));

import { getMessages } from "@/features/messages/messages.service";
import type { Message } from "@/features/messages/messages";
import userMock from "@/features/users/user/user.d.mock";

const mockedGetMessages = vi.mocked(getMessages);

const messages: Message[] = [
  { user: userMock[0], message: "Olá! Vi seu anúncio, ainda está disponível?", time: new Date("2026-08-20T09:15:00") },
];

describe("Chat", () => {
  beforeEach(() => {
    mockedGetMessages.mockReset();
  });

  it("renders the draft field and send button", () => {
    mockedGetMessages.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Chat />
      </MemoryRouter>,
    );

    expect(screen.getByPlaceholderText("Escreva uma mensagem...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar mensagem" })).toBeInTheDocument();
  });

  it("renders the mocked message history", async () => {
    mockedGetMessages.mockResolvedValue(messages);

    render(
      <MemoryRouter>
        <Chat />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Olá! Vi seu anúncio, ainda está disponível?")).toBeInTheDocument();
  });
});
