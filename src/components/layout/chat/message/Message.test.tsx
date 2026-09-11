import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Message as MessageInterface } from "@/features/messages/messages";
import type { User } from "@/features/users/user/user";
import Message from "./Message";

const owner: User = {
  id: "1",
  authId: "auth-1",
  active: true,
  name: "Jane Doe",
  cpf: "00000000000",
  birthDate: "1990-01-01",
};

const message: MessageInterface = {
  user: owner,
  message: "Hello there",
  time: new Date(2026, 0, 1, 9, 5),
};

describe("Message", () => {
  it("renders the message content", () => {
    render(<Message message={message} owner={owner} />);

    expect(screen.getByText("Hello there")).toBeInTheDocument();
  });

  it("renders the formatted hour", () => {
    render(<Message message={message} owner={owner} />);

    expect(screen.getByText("9:5")).toBeInTheDocument();
  });
});
