import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RegistrationDecision from "./Decision";
import { notify } from "@@/feedback/toast/Toast.utils";
vi.mock("@@/feedback/toast/Toast.utils", () => ({ notify: vi.fn() }));

describe("RegistrationDecision", () => {
  it("does not submit until confirmed and prevents duplicate submissions", () => {
    const decide = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<RegistrationDecision name="Solar" onDecision={decide} />);
    fireEvent.click(screen.getByRole("button", { name: "Aprovar" }));
    expect(decide).not.toHaveBeenCalled();
    const confirm = screen.getByRole("button", { name: "confirmar" });
    fireEvent.click(confirm);
    fireEvent.click(confirm);
    expect(decide).toHaveBeenCalledTimes(1);
    expect(decide).toHaveBeenCalledWith(true);
    expect(confirm).toBeDisabled();
  });

  it("closes the modal and notifies failure without reporting success", async () => {
    vi.mocked(notify).mockClear();
    render(<RegistrationDecision name="Solar" onDecision={vi.fn().mockRejectedValue(new Error("network"))} />);
    fireEvent.click(screen.getByRole("button", { name: "Rejeitar" }));
    fireEvent.click(screen.getByRole("button", { name: "confirmar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith("N\u00e3o foi poss\u00edvel registrar a decis\u00e3o.");
  });
});
