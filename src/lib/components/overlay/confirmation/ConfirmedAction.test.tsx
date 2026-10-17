import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ConfirmedAction from "./ConfirmedAction";
import { notify } from "@@/feedback/toast/Toast.utils";

vi.mock("@@/feedback/toast/Toast.utils", () => ({ notify: vi.fn() }));

describe("ConfirmedAction", () => {
  it("requires confirmation, supports cancel and blocks repeat submissions", async () => {
    let finish!: () => void;
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    render(<ConfirmedAction label="Excluir" name="Oferta" onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "cancelar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    fireEvent.click(screen.getByRole("button", { name: "confirmar" }));
    expect(screen.getByRole("button", { name: "confirmar" })).toBeDisabled();
    expect(onConfirm).toHaveBeenCalledTimes(1);
    finish();
    await waitFor(() => expect(notify).toHaveBeenCalledWith("Ação concluída."));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("reports rejection without success feedback", async () => {
    vi.mocked(notify).mockClear();
    render(<ConfirmedAction label="Revogar" name="Código" onConfirm={() => Promise.reject(new Error("offline"))} />);
    fireEvent.click(screen.getByRole("button", { name: "Revogar" }));
    fireEvent.click(screen.getByRole("button", { name: "confirmar" }));
    await waitFor(() => expect(notify).toHaveBeenCalledWith("Não foi possível concluir a ação."));
    expect(notify).toHaveBeenCalledTimes(1);
  });
});
