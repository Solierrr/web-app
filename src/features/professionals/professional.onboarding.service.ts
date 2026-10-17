import i18n from "@/config/i18n/internationalization";
import { httpJson } from "@/lib/shared/http/http.service";
import { API_CORE_URL } from "@/lib/shared/http/apiCore.utils";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";

const SERVICE_NAME = "professionalOnboarding";

export interface Profession {
  id: string;
  name: string;
  requiresRegistration?: boolean;
}

export async function getProfessions(): Promise<Profession[]> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return [
      { id: "mock-installer", name: i18n.t("services:professionalOnboarding.installer") },
      { id: "mock-engineer", name: i18n.t("services:professionalOnboarding.engineer") },
    ];
  }
  return httpJson<Profession[]>(`${API_CORE_URL}/professions`, {
    service: SERVICE_NAME,
    operation: "getProfessions",
    errorMessage: i18n.t("services:professionalOnboarding.getProfessions"),
  });
}

export function createPerson(payload: {
  name: string;
  cpf: string;
  birthDate: string;
  contact?: { email?: string; phone?: string };
}): Promise<{ id: string }> {
  return httpJson<{ id: string }>(`${API_CORE_URL}/persons`, {
    service: SERVICE_NAME,
    operation: "createPerson",
    method: "POST",
    body: payload,
    errorMessage: i18n.t("services:professionalOnboarding.createPerson"),
  });
}

export function createTechnician(payload: { personId: string; crea: string }): Promise<{ id: string }> {
  return httpJson<{ id: string }>(`${API_CORE_URL}/technicians`, {
    service: SERVICE_NAME,
    operation: "createTechnician",
    method: "POST",
    body: payload,
    errorMessage: i18n.t("services:professionalOnboarding.createTechnician"),
  });
}

export function createProfessionalRegistration(payload: {
  technicianId: string;
  professionId: string;
  council?: string;
  number?: string;
  expirationDate?: string;
}): Promise<{ id: string }> {
  return httpJson<{ id: string }>(`${API_CORE_URL}/professional-registrations`, {
    service: SERVICE_NAME,
    operation: "createProfessionalRegistration",
    method: "POST",
    body: payload,
    errorMessage: i18n.t("services:professionalOnboarding.createProfessionalRegistration"),
  });
}
