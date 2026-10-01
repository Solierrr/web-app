import { httpJson } from "@/lib/shared/http/http.service";
import { API_CORE_URL } from "@/lib/shared/http/apiCore.utils";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import { getMockUnits, saveMockAddress, saveMockUnit, deleteMockUnit } from "./unit.d.mocks";

const SERVICE_NAME = "unit";

export interface Requester {
  id: string;
  companyId: string;
}

export interface Address {
  id: string;
  state: string;
  city: string;
  neighborhood: string | null;
  zipCode: string;
  street: string;
  number: string | null;
}

export interface LocalUnit {
  id: string;
  requesterId: string;
  address: Address | null;
  complement: string | null;
  locationType: "BUILDING" | "HOUSE" | "COMPLEX";
}

export async function getMyRequester(companyId: string): Promise<Requester | null> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return { id: companyId, companyId };
  }
  return httpJson<{ id: string; company: { id: string } }[]>(`${API_CORE_URL}/requesters/company/${encodeURIComponent(companyId)}`, {
    service: SERVICE_NAME,
    operation: "getMyRequester",
    errorMessage: "Não foi possível carregar os dados de solicitante",
  }).then((requesters) => {
    const first = requesters[0];
    return first ? { id: first.id, companyId: first.company.id } : null;
  });
}

export async function listCompanyUnits(companyId: string): Promise<LocalUnit[]> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return getMockUnits(companyId);
  }
  return httpJson<LocalUnit[]>(`${API_CORE_URL}/local-units/company/${encodeURIComponent(companyId)}`, {
    service: SERVICE_NAME,
    operation: "listCompanyUnits",
    errorMessage: "Não foi possível carregar as unidades",
  });
}

export interface AddressPayload {
  state: string;
  city: string;
  neighborhood?: string;
  zipCode: string;
  street: string;
  number?: string;
}

export async function createAddress(payload: AddressPayload): Promise<{ id: string }> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return saveMockAddress(payload);
  }
  return httpJson<{ id: string }>(`${API_CORE_URL}/addresses`, {
    service: SERVICE_NAME,
    operation: "createAddress",
    method: "POST",
    body: payload,
    errorMessage: "Não foi possível cadastrar o endereço",
  });
}

export async function createGeolocalization(addressId: string, latitude: number, longitude: number): Promise<{ id: string }> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return { id: crypto.randomUUID() };
  }
  return httpJson<{ id: string }>(`${API_CORE_URL}/geolocalizations`, {
    service: SERVICE_NAME,
    operation: "createGeolocalization",
    method: "POST",
    body: { addressId, latitude, longitude },
    errorMessage: "Não foi possível salvar a localização no mapa",
  });
}

export interface UnitPayload {
  requesterId: string;
  addressId?: string;
  complement?: string;
  locationType: LocalUnit["locationType"];
}

export async function createUnit(payload: UnitPayload): Promise<LocalUnit> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return saveMockUnit(payload);
  }
  return httpJson<LocalUnit>(`${API_CORE_URL}/local-units`, {
    service: SERVICE_NAME,
    operation: "createUnit",
    method: "POST",
    body: payload,
    errorMessage: "Não foi possível cadastrar a unidade",
  });
}

export async function updateUnit(id: string, payload: UnitPayload): Promise<LocalUnit> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return saveMockUnit(payload, id);
  }
  return httpJson<LocalUnit>(`${API_CORE_URL}/local-units/${encodeURIComponent(id)}`, {
    service: SERVICE_NAME,
    operation: "updateUnit",
    method: "PUT",
    body: payload,
    errorMessage: `Não foi possível atualizar a unidade ${id}`,
  });
}

export async function deleteUnit(id: string): Promise<void> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    deleteMockUnit(id);
    return;
  }
  return httpJson<void>(`${API_CORE_URL}/local-units/${encodeURIComponent(id)}`, {
    service: SERVICE_NAME,
    operation: "deleteUnit",
    method: "DELETE",
    errorMessage: `Não foi possível remover a unidade ${id}`,
  });
}
