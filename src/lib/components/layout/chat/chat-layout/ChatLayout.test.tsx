import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Message } from "@/features/messages/messages";
import type { User } from "@/features/users/user/user";
import ChatLayout from "./ChatLayout";

const user = (id: string, name: string): User => ({
  id,
  authId: `auth-${id}`,
  active: true,
  name,
  cpf: "00000000000",
  birthDate: "1990-01-01",
});

const owner = user("1", "Jane Doe");
const other = user("2", "John Roe");

function message(from: User, text: string, minute: number): Message {
  return { user: from, message: text, time: new Date(2026, 0, 1, 9, minute) };
}

describe("ChatLayout", () => {
  it("shows the hour only on the last message of a sequence from the same author", () => {
    render(<ChatLayout owner={owner} messages={[message(other, "one", 0), message(other, "two", 1), message(owner, "three", 2)]} />);

    expect(screen.queryByText("09:00")).not.toBeInTheDocument();
    expect(screen.getByText("09:01")).toBeInTheDocument();
    expect(screen.getByText("09:02")).toBeInTheDocument();
  });

  it("starts a new sequence after the grouping window", () => {
    render(<ChatLayout owner={owner} messages={[message(other, "one", 0), message(other, "two", 10)]} />);

    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.getByText("09:10")).toBeInTheDocument();
  });
});
