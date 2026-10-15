import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Submission from "./Submission";
import * as service from "../professional.submission.service";
import { getProfessions } from "../professional.onboarding.service";
vi.mock("@@/layout/access/canvas/SideCanvas", () => ({ default: () => null }));
vi.mock("../professional.onboarding.service", () => ({ getProfessions: vi.fn() }));
vi.mock("../professional.submission.service", () => ({
  getProfessionalAccount: vi.fn(),
  getProfessionalPolicy: vi.fn(),
  saveProfessionalDraft: vi.fn(),
  submitProfessional: vi.fn(),
  uploadProfessionalDocument: vi.fn(),
}));
const account = {
  revision: 2,
  approvedVersion: 0,
  suspended: false,
  approved: null,
  submissions: [],
  draft: {
    revision: 2,
    name: "Ana",
    cpf: "52998224725",
    birthDate: "1990-01-01",
    email: "ana@example.com",
    phone: "11999999999",
    professionId: "electric",
    council: "CREA",
    registrationNumber: "SP123",
    registrationExpiration: null,
    documentIds: [],
  },
};
const page = () =>
  render(
    <MemoryRouter>
      <Submission />
    </MemoryRouter>,
  );
describe("Submission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(service.getProfessionalAccount).mockResolvedValue(account);
    vi.mocked(getProfessions).mockResolvedValue([{ id: "electric", name: "Eletricista" }]);
    vi.mocked(service.getProfessionalPolicy).mockResolvedValue({
      version: 1,
      configured: true,
      requiresRegistration: true,
      requiredDocuments: ["IDENTITY"],
      criteria: [],
    });
    vi.mocked(service.saveProfessionalDraft).mockResolvedValue(account);
  });
  it("loads the entire area before exposing fields", () => {
    vi.mocked(service.getProfessionalAccount).mockReturnValue(new Promise(() => {}));
    page();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });
  it("preserves values in a collapsed section when saving the draft", async () => {
    page();
    await screen.findByDisplayValue("Ana");
    const section = screen.getByRole("button", { name: "Número do registro profissional" });
    expect(section).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(section);
    fireEvent.change(screen.getByRole("textbox", { name: "Número do registro profissional" }), { target: { value: "SP456" } });
    fireEvent.click(section);
    fireEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));
    await waitFor(() =>
      expect(service.saveProfessionalDraft).toHaveBeenCalledWith(expect.objectContaining({ revision: 2, registrationNumber: "SP456" })),
    );
    expect(service.submitProfessional).not.toHaveBeenCalled();
  });
});
