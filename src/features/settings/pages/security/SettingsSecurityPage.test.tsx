import Toast from "@@/feedback/toast/Toast";
import { beforeEach as beforeToastTest } from "vitest";
beforeToastTest(() => {
  render(<Toast />);
});
vi.mock("@@/layout/access/canvas/SideCanvas", () => ({ default: () => null }));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: vi.fn(), clearAuthSession: vi.fn() }));
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SettingsSecurityPage from "./SettingsSecurityPage";
import { changePassword } from "@/features/access/access.credentials.service";
import { getAuthSession, clearAuthSession } from "@/lib/shared/auth/authToken.utils";

vi.mock("@/features/access/access.credentials.service", () => ({
  changePassword: vi.fn(),
}));

describe("SettingsSecurityPage", () => {
  it("shows an error when there is no linked API account", async () => {
    vi.mocked(getAuthSession).mockReturnValue(null);
    render(<SettingsSecurityPage />);

    fireEvent.change(screen.getByLabelText("Senha atual"), { target: { value: "current-password" } });
    fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: "a-very-long-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(await screen.findByText(/verificar/)).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("changes the password when a API account is linked", async () => {
    vi.mocked(getAuthSession).mockReturnValue({} as never);
    vi.mocked(changePassword).mockResolvedValue(undefined);
    render(<SettingsSecurityPage />);

    fireEvent.change(screen.getByLabelText("Senha atual"), { target: { value: "current-password" } });
    fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: "a-very-long-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => expect(changePassword).toHaveBeenCalledWith("current-password", "a-very-long-password"));
    expect(await screen.findByRole("status")).toBeInTheDocument();
    expect(clearAuthSession).toHaveBeenCalled();
  });
});
