import { describe, expect, it, vi } from "vitest";
import {
  createContact,
  createPerson,
  createProfessionalRegistration,
  createTechnician,
  getProfessions,
} from "./professional.onboarding.service";
import { httpJson } from "@/lib/shared/http/http.service";

vi.mock("@/lib/shared/http/http.service", () => ({ httpJson: vi.fn() }));

describe("professional.onboarding.service", () => {
  it("lists professions", async () => {
    vi.mocked(httpJson).mockResolvedValue([{ id: "profession-1", name: "Eletricista" }]);
    await expect(getProfessions()).resolves.toEqual([{ id: "profession-1", name: "Eletricista" }]);
    expect(httpJson).toHaveBeenCalledWith(expect.stringContaining("/professions"), expect.objectContaining({ operation: "getProfessions" }));
  });

  it("creates a contact", async () => {
    vi.mocked(httpJson).mockResolvedValue({ id: "contact-1" });
    await createContact({ email: "user@example.com" });
    expect(httpJson).toHaveBeenCalledWith(
      expect.stringContaining("/contacts"),
      expect.objectContaining({ method: "POST", body: { email: "user@example.com" } }),
    );
  });

  it("creates a person linked to the user and contact", async () => {
    vi.mocked(httpJson).mockResolvedValue({ id: "person-1" });
    await createPerson({ userId: "user-1", contactId: "contact-1", name: "Fulano", cpf: "52998224725", birthDate: "1990-01-01" });
    expect(httpJson).toHaveBeenCalledWith(
      expect.stringContaining("/persons"),
      expect.objectContaining({
        method: "POST",
        body: { userId: "user-1", contactId: "contact-1", name: "Fulano", cpf: "52998224725", birthDate: "1990-01-01" },
      }),
    );
  });

  it("creates a technician linked to the person", async () => {
    vi.mocked(httpJson).mockResolvedValue({ id: "technician-1" });
    await createTechnician({ personId: "person-1", crea: "SP-123456" });
    expect(httpJson).toHaveBeenCalledWith(
      expect.stringContaining("/technicians"),
      expect.objectContaining({ method: "POST", body: { personId: "person-1", crea: "SP-123456" } }),
    );
  });

  it("creates a professional registration", async () => {
    vi.mocked(httpJson).mockResolvedValue({ id: "registration-1" });
    await createProfessionalRegistration({ technicianId: "technician-1", professionId: "profession-1" });
    expect(httpJson).toHaveBeenCalledWith(
      expect.stringContaining("/professional-registrations"),
      expect.objectContaining({ method: "POST", body: { technicianId: "technician-1", professionId: "profession-1" } }),
    );
  });
});
