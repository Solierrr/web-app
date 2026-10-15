import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Confirmation from "./Confirmation";

describe("Confirmation", () => {
  it("locks scrolling, restores it on close and allows cancellation", async () => {
    const cancel = vi.fn();
    const original = document.body.style.overflow;
    const { unmount } = render(<Confirmation title="Confirmar" message="Tem certeza?" busy={false} onConfirm={vi.fn()} onCancel={cancel} />);
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true }));
    await waitFor(() => expect(cancel).toHaveBeenCalledTimes(1));
    unmount();
    expect(document.body.style.overflow).toBe(original);
  });

  it("closes through the X once, after the exit animation", async () => {
    const cancel = vi.fn();
    render(<Confirmation title="Confirmar" message="Tem certeza?" busy={false} onConfirm={vi.fn()} onCancel={cancel} />);
    fireEvent.click(screen.getByRole("button", { name: /fechar/i }));
    expect(screen.getByRole("dialog")).toHaveAttribute("data-closing", "true");
    expect(screen.getByRole("button", { name: "confirmar" })).toBeDisabled();
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true }));
    await waitFor(() => expect(cancel).toHaveBeenCalledTimes(1));
  });

  it("prevents cancellation and repeated confirmation during an operation", () => {
    const cancel = vi.fn();
    const confirm = vi.fn();
    render(<Confirmation title="Confirmar" message="Tem certeza?" busy onConfirm={confirm} onCancel={cancel} />);
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true }));
    fireEvent.click(screen.getByRole("button", { name: "confirmar" }));
    expect(cancel).not.toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /fechar/i })).toBeDisabled();
  });
});
