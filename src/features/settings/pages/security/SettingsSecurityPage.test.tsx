import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SettingsSecurityPage from "./SettingsSecurityPage";
import { changePassword, getCurrentFirebaseUser } from "@/config/firebase/auth/auth.service";

vi.mock("@/config/firebase/auth/auth.service", () => ({
  changePassword: vi.fn(),
  getCurrentFirebaseUser: vi.fn(),
}));

describe("SettingsSecurityPage", () => {
  it("shows an error when there is no linked firebase account", async () => {
    vi.mocked(getCurrentFirebaseUser).mockReturnValue(null);
    render(<SettingsSecurityPage />);

    fireEvent.change(screen.getByLabelText("Senha atual"), { target: { value: "current-password" } });
    fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: "a-very-long-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/verificar/);
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("changes the password when a firebase account is linked", async () => {
    vi.mocked(getCurrentFirebaseUser).mockReturnValue({} as never);
    vi.mocked(changePassword).mockResolvedValue(undefined);
    render(<SettingsSecurityPage />);

    fireEvent.change(screen.getByLabelText("Senha atual"), { target: { value: "current-password" } });
    fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: "a-very-long-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => expect(changePassword).toHaveBeenCalledWith("current-password", "a-very-long-password"));
    expect(await screen.findByRole("status")).toBeInTheDocument();
  });
});
