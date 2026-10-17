import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { SidePanelProvider } from "@@/layout/side-panel/SidePanel.provider";
import ReviewPanel from "./ReviewPanel";
import { getReviewDetails, decideReview } from "./ReviewPanel.service";
import { notify } from "@@/feedback/toast/Toast.utils";
import type { ProfessionalSubmission } from "../professional.submission";
vi.mock("./ReviewPanel.service", () => ({ getReviewDetails: vi.fn(), decideReview: vi.fn(), loadReviewDocument: vi.fn() }));
vi.mock("@@/feedback/toast/Toast.utils", () => ({ notify: vi.fn() }));
vi.mock("@@/ui/document-viewer/DocumentViewer", () => ({ default: () => <div>Document reader</div> }));
const submission = (id: string) =>
  ({
    id,
    revision: 3,
    status: "MANUAL_REVIEW",
    snapshot: { name: id === "one" ? "Carlos" : "Fernanda", council: "CREA", registrationNumber: "123", email: "demo@example.com", phone: "" },
  }) as ProfessionalSubmission;
const reload = vi.fn();
const onDecided = vi.fn();
function setup(
  order = [
    { id: "one", name: "Carlos" },
    { id: "two", name: "Fernanda" },
  ],
) {
  render(
    <MemoryRouter>
      <SidePanelProvider>
        <ReviewPanel initialId="one" order={order} reloadQueue={reload} onDecided={onDecided} />
      </SidePanelProvider>
    </MemoryRouter>,
  );
}
async function approve() {
  fireEvent.click(await screen.findByRole("button", { name: "Aprovar" }));
  fireEvent.change(screen.getByPlaceholderText("Descreva o motivo da decis\u00e3o"), { target: { value: "Documentos conferidos no teste local." } });
  fireEvent.click(screen.getByRole("button", { name: "confirmar" }));
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getReviewDetails).mockImplementation(async (id) => ({ submission: submission(id), documents: [] }));
  vi.mocked(decideReview).mockImplementation(async (item, approved) => ({ ...item, status: approved ? "APPROVED" : "REJECTED" }));
  onDecided.mockResolvedValue(undefined);
  reload.mockResolvedValue([]);
});
describe("ReviewPanel", () => {
  it("requires a reason before a decision, then advances to the next professional", async () => {
    setup();
    fireEvent.click(await screen.findByRole("button", { name: "Aprovar" }));
    fireEvent.click(screen.getByRole("button", { name: "confirmar" }));
    expect(decideReview).not.toHaveBeenCalled();
    expect(screen.getByText("Informe uma justificativa para continuar.")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Descreva o motivo da decis\u00e3o"), { target: { value: " Conferido " } });
    fireEvent.click(screen.getByRole("button", { name: "confirmar" }));
    await screen.findByRole("heading", { name: "Fernanda" });
    expect(decideReview).toHaveBeenCalledWith(expect.objectContaining({ id: "one", revision: 3 }), true, "Conferido");
    expect(notify).toHaveBeenCalledWith("Cadastro aprovado.");
  });
  it("stays on the same professional and keeps the dialog when the decision fails", async () => {
    vi.mocked(decideReview).mockRejectedValue(new Error("conflict"));
    setup();
    await approve();
    await waitFor(() => expect(notify).toHaveBeenCalled());
    expect(screen.getByRole("heading", { name: "Carlos" })).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(onDecided).not.toHaveBeenCalled();
  });
  it("shows the exhausted queue message and reloads new candidates", async () => {
    setup([{ id: "one", name: "Carlos" }]);
    await approve();
    await screen.findByText("N\u00e3o h\u00e1 mais nada para validar por enquanto");
    reload.mockResolvedValue([{ id: "two", name: "Fernanda" }]);
    fireEvent.click(screen.getAllByRole("button", { name: "Atualizar fila" }).at(-1)!);
    await screen.findByRole("heading", { name: "Fernanda" });
  });
  it("allows opting out of automatic advancement", async () => {
    setup();
    fireEvent.click(screen.getByRole("checkbox"));
    await approve();
    await waitFor(() => expect(notify).toHaveBeenCalledWith("Cadastro aprovado."));
    expect(screen.getByRole("heading", { name: "Carlos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aprovar" })).toBeDisabled();
  });
});
