import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DocumentViewer from "./DocumentViewer";
const create = vi.fn(() => "blob:demo");
const revoke = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(URL, "createObjectURL", { configurable: true, value: create });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revoke });
});
describe("DocumentViewer", () => {
  it("offers download for unsupported formats and releases temporary URLs on replacement and close", async () => {
    const load = vi.fn().mockResolvedValue(new Blob(["demonstration"], { type: "text/plain" }));
    const { rerender, unmount } = render(<DocumentViewer document={{ id: "one", name: "one.txt" }} load={load} />);
    await screen.findByText("Visualiza\u00e7\u00e3o indispon\u00edvel para este formato");
    expect(screen.getByRole("button", { name: "Baixar documento original" })).toBeEnabled();
    rerender(<DocumentViewer document={{ id: "two", name: "two.txt" }} load={load} />);
    await waitFor(() => expect(load).toHaveBeenCalledWith("two"));
    await waitFor(() => expect(create).toHaveBeenCalledTimes(2));
    expect(revoke).toHaveBeenCalledTimes(1);
    unmount();
    expect(revoke).toHaveBeenCalledTimes(2);
  });
  it("shows a recoverable error instead of an endless loader", async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue(new Blob(["demo"], { type: "text/plain" }));
    render(<DocumentViewer document={{ id: "one", name: "one.txt" }} load={load} />);
    fireEvent.click(await screen.findByRole("button", { name: "Tentar novamente" }));
    await screen.findByText("Visualiza\u00e7\u00e3o indispon\u00edvel para este formato");
    expect(load).toHaveBeenCalledTimes(2);
  });
});
