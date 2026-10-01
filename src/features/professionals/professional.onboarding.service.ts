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
    return [{ id: "mock-installer", name: "Instalador de sistemas solares" }, { id: "mock-engineer", name: "Engenheiro eletricista" }];
  }
  return httpJson<Profession[]>(`${API_CORE_URL}/professions`, {
    service: SERVICE_NAME,
    operation: "getProfessions",
    errorMessage: "Não foi possível carregar as profissões",
  });
}

export function createContact(payload: { email?: string; phone?: string }): Promise<{ id: string }> {
  return httpJson<{ id: string }>(`${API_CORE_URL}/contacts`, {
    service: SERVICE_NAME,
    operation: "createContact",
    method: "POST",
    body: payload,
    errorMessage: "Não foi possível cadastrar o contato",
  });
}

export function createPerson(payload: {
  userId: string;
  contactId: string;
  name: string;
  cpf: string;
  birthDate: string;
}): Promise<{ id: string }> {
  return httpJson<{ id: string }>(`${API_CORE_URL}/persons`, {
    service: SERVICE_NAME,
    operation: "createPerson",
    method: "POST",
    body: payload,
    errorMessage: "Não foi possível cadastrar seus dados pessoais",
  });
}

export function createTechnician(payload: { personId: string; crea: string }): Promise<{ id: string }> {
  return httpJson<{ id: string }>(`${API_CORE_URL}/technicians`, {
    service: SERVICE_NAME,
    operation: "createTechnician",
    method: "POST",
    body: payload,
    errorMessage: "Não foi possível cadastrar seu registro profissional",
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
    errorMessage: "Não foi possível concluir o registro profissional",
  });
}
