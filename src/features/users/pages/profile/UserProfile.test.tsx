import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import UserProfile from "./UserProfile";

vi.mock("@/features/users/user/user.service", () => ({
  getMyUser: vi.fn(),
  updateMyUser: vi.fn(),
}));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => ({ email: "marina@example.test" }) }));

import { getMyUser, type MyUser } from "@/features/users/user/user.service";

const mockedGetUser = vi.mocked(getMyUser);

const user: MyUser = {
  id: "user-1",
  authId: "auth-1",
  active: true,
  username: "marina_alves",
  avatar: null,
  banner: null,
};

describe("UserProfile", () => {
  beforeEach(() => {
    mockedGetUser.mockReset();
  });

  it("renders a skeleton while the user is loading", () => {
    mockedGetUser.mockReturnValue(new Promise(() => {}));

    render(<UserProfile />);

    expect(screen.queryByText("marina_alves")).not.toBeInTheDocument();
  });

  it("renders the mocked user once loaded", async () => {
    mockedGetUser.mockResolvedValue(user);

    render(<UserProfile />);

    expect(await screen.findByRole("heading", { name: "marina_alves" })).toBeInTheDocument();
    expect(screen.getByText("marina@example.test")).toBeInTheDocument();
  });
});
