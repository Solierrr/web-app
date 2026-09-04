import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import UserProfile from "./UserProfile";

vi.mock("@/features/users/user/user.service", () => ({
  getUser: vi.fn(),
}));

import { getUser } from "@/features/users/user/user.service";
import type { User } from "@/features/users/user/user";

const mockedGetUser = vi.mocked(getUser);

const user: User = {
  id: "user-1",
  authId: "auth-1",
  active: true,
  name: "Marina Alves Ferreira",
  cpf: "12345678901",
  birthDate: "1991-04-18",
  contact: { number: "31988887777", email: "marina.ferreira@gmail.com" },
};

describe("UserProfile", () => {
  beforeEach(() => {
    mockedGetUser.mockReset();
  });

  it("renders a skeleton while the user is loading", () => {
    mockedGetUser.mockReturnValue(new Promise(() => {}));

    render(<UserProfile />);

    expect(screen.queryByText("Marina Alves Ferreira")).not.toBeInTheDocument();
  });

  it("renders the mocked user once loaded", async () => {
    mockedGetUser.mockResolvedValue(user);

    render(<UserProfile />);

    expect(await screen.findByRole("heading", { name: "Marina Alves Ferreira" })).toBeInTheDocument();
    expect(screen.getByText("31988887777")).toBeInTheDocument();
  });
});
