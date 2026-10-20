import { waitFor, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BrandRequestsTable from "./BrandRequestsTable";
import { listBrandRequests, cancelBrandRequest, decideBrandRequest } from "../brand.service";
import { notify } from "@@/feedback/toast/Toast.utils";
import type { BrandRequest } from "../brand";
vi.mock("../brand.service", () => ({ listBrandRequests: vi.fn(), cancelBrandRequest: vi.fn(), decideBrandRequest: vi.fn() }));
vi.mock("@@/feedback/toast/Toast.utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@@/feedback/toast/Toast.utils")>();
  return { ...actual, notify: vi.fn(actual.notify) };
});
vi.mock("@/lib/shared/context/ActiveContext", () => ({ useActiveContext: () => ({ can: () => true }) }));
const row: BrandRequest = {
  id: "request-1",
  brandId: "brand-1",
  requesterCompanyId: "company-1",
  kind: "PUBLICATION",
  status: "PENDING",
  proposedName: "Solar Brand",
  createdAt: "2026-10-10T12:00:00Z",
  revision: 2,
};
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listBrandRequests).mockResolvedValue([row]);
});
async function open(admin = false) {
  render(
    <MemoryRouter>
      <BrandRequestsTable admin={admin} />
    </MemoryRouter>,
  );
  fireEvent.click(await screen.findByRole("button", { name: "Solar Brand" }));
  return screen.findByRole("dialog", { name: "Solicitação de marca" });
}
describe("BrandRequestsTable", () => {
  it("requires confirmation before cancellation and reports the returned status", async () => {
    vi.mocked(cancelBrandRequest).mockResolvedValue({ ...row, status: "CANCELLED", revision: 3 });
    const dialog = await open();
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancelar solicitação" }));
    expect(cancelBrandRequest).not.toHaveBeenCalled();
    const confirm = screen.getByRole("dialog", { name: "Cancelar solicitação" });
    fireEvent.click(within(confirm).getByRole("button", { name: /confirmar/i }));
    await screen.findByText("Cancelada");
    expect(cancelBrandRequest).toHaveBeenCalledWith(row);
    expect(notify).toHaveBeenCalledOnce();
    expect(document.body.style.overflow).toBe("");
  });
  it("requires a rejection reason before opening confirmation", async () => {
    const dialog = await open(true);
    fireEvent.click(within(dialog).getByRole("button", { name: "Reprovar" }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Informe o motivo");
    expect(decideBrandRequest).not.toHaveBeenCalled();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(within(dialog).getByRole("textbox")).toHaveFocus();
  });
  it("reviews the exact revision and sends the reason after confirmation", async () => {
    vi.mocked(decideBrandRequest).mockResolvedValue({ ...row, status: "REJECTED", revision: 3, decisionReason: "Sem referência" });
    const dialog = await open(true);
    fireEvent.change(within(dialog).getByRole("textbox"), { target: { value: "Sem referência" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Reprovar" }));
    const confirm = screen.getByRole("dialog", { name: "Reprovar" });
    fireEvent.click(within(confirm).getByRole("button", { name: /confirmar/i }));
    await screen.findByText("Reprovada");
    expect(decideBrandRequest).toHaveBeenCalledWith(row, false, "Sem referência");
    expect(notify).toHaveBeenCalledOnce();
    expect(document.body.style.overflow).toBe("");
  });
  it("does not emit a success notification when the API rejects a stale request", async () => {
    vi.mocked(decideBrandRequest).mockRejectedValue(new Error("Solicitação desatualizada"));
    const dialog = await open(true);
    fireEvent.click(within(dialog).getByRole("button", { name: "Aprovar" }));
    fireEvent.click(within(screen.getByRole("dialog", { name: "Aprovar" })).getByRole("button", { name: /confirmar/i }));
    await waitFor(() => expect(notify).toHaveBeenCalledWith(expect.stringContaining("desatualizada")));
  });
});
