import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfessionalOnboarding from "./ProfessionalOnboarding";
import * as onboardingService from "@/features/professionals/professional.onboarding.service";
import { getMyUser } from "@/features/users/user/user.service";
import { validateCertificates } from "@/lib/shared/validation/aiValidation.service";

vi.mock("@/features/professionals/professional.onboarding.service", () => ({
  getProfessions: vi.fn(),
  createContact: vi.fn(),
  createPerson: vi.fn(),
  createTechnician: vi.fn(),
  createProfessionalRegistration: vi.fn(),
}));
vi.mock("@/features/users/user/user.service", () => ({ getMyUser: vi.fn() }));
vi.mock("@/lib/shared/validation/aiValidation.service", () => ({ validateCertificates: vi.fn() }));

const VALID_CPF = "529.982.247-25";

function fillBaseFields() {
  fireEvent.change(screen.getByLabelText("Nome completo"), { target: { value: "Fulano da Silva" } });
  fireEvent.change(screen.getByLabelText("CPF"), { target: { value: VALID_CPF } });
  fireEvent.change(screen.getByLabelText("Data de nascimento"), { target: { value: "1990-01-01" } });
  fireEvent.change(screen.getByLabelText("CREA/registro profissional"), { target: { value: "SP-123456" } });
  fireEvent.change(screen.getByLabelText("Profissão"), { target: { value: "profession-1" } });
}

describe("ProfessionalOnboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(onboardingService.getProfessions).mockResolvedValue([{ id: "profession-1", name: "Eletricista" }]);
  });

  it("rejects an invalid cpf before calling the backend", async () => {
    render(
      <MemoryRouter>
        <ProfessionalOnboarding />
      </MemoryRouter>,
    );
    await screen.findByText("Eletricista");

    fillBaseFields();
    fireEvent.change(screen.getByLabelText("CPF"), { target: { value: "111.111.111-11" } });
    fireEvent.click(screen.getByRole("button", { name: "Concluir cadastro" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("CPF inválido");
    expect(onboardingService.createContact).not.toHaveBeenCalled();
  });

  it("creates the contact, person, technician and professional registration", async () => {
    vi.mocked(getMyUser).mockResolvedValue({ id: "user-1", authId: "auth-1", username: "solar", avatar: null, banner: null, active: true });
    vi.mocked(onboardingService.createContact).mockResolvedValue({ id: "contact-1" });
    vi.mocked(onboardingService.createPerson).mockResolvedValue({ id: "person-1" });
    vi.mocked(onboardingService.createTechnician).mockResolvedValue({ id: "technician-1" });
    vi.mocked(onboardingService.createProfessionalRegistration).mockResolvedValue({ id: "registration-1" });

    render(
      <MemoryRouter>
        <ProfessionalOnboarding />
      </MemoryRouter>,
    );
    await screen.findByText("Eletricista");
    fillBaseFields();
    fireEvent.click(screen.getByRole("button", { name: "Concluir cadastro" }));

    await waitFor(() => expect(onboardingService.createPerson).toHaveBeenCalledWith({
      userId: "user-1", contactId: "contact-1", name: "Fulano da Silva", cpf: "52998224725", birthDate: "1990-01-01",
    }));
    expect(onboardingService.createTechnician).toHaveBeenCalledWith({ personId: "person-1", crea: "SP-123456" });
    expect(onboardingService.createProfessionalRegistration).toHaveBeenCalledWith(expect.objectContaining({
      technicianId: "technician-1", professionId: "profession-1",
    }));
    expect(validateCertificates).not.toHaveBeenCalled();
    expect(await screen.findByText("Em análise")).toBeInTheDocument();
  });

  it("validates certificates when both urls are provided", async () => {
    vi.mocked(getMyUser).mockResolvedValue({ id: "user-1", authId: "auth-1", username: "solar", avatar: null, banner: null, active: true });
    vi.mocked(onboardingService.createContact).mockResolvedValue({ id: "contact-1" });
    vi.mocked(onboardingService.createPerson).mockResolvedValue({ id: "person-1" });
    vi.mocked(onboardingService.createTechnician).mockResolvedValue({ id: "technician-1" });
    vi.mocked(onboardingService.createProfessionalRegistration).mockResolvedValue({ id: "registration-1" });
    vi.mocked(validateCertificates).mockResolvedValue({ status: "ACCEPT", reason: "Ok", error_code: null, extracted_data: null });

    render(
      <MemoryRouter>
        <ProfessionalOnboarding />
      </MemoryRouter>,
    );
    await screen.findByText("Eletricista");
    fillBaseFields();
    fireEvent.change(screen.getByLabelText("Certificado NR-10 (URL)"), { target: { value: "https://example.com/nr10.jpg" } });
    fireEvent.change(screen.getByLabelText("Certificado NR-35 (URL)"), { target: { value: "https://example.com/nr35.jpg" } });
    fireEvent.click(screen.getByRole("button", { name: "Concluir cadastro" }));

    await waitFor(() => expect(validateCertificates).toHaveBeenCalledWith("https://example.com/nr10.jpg", "https://example.com/nr35.jpg"));
    expect(await screen.findByText("Certificados válidos.")).toBeInTheDocument();
  });
});
