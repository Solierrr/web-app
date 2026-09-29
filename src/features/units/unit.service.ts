import { httpJson } from "@/shared/http/http.service";
import { API_CORE_URL } from "@/shared/http/apiCore.utils";

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

export function getMyRequester(companyId: string): Promise<Requester | null> {
  return httpJson<{ id: string; company: { id: string } }[]>(`${API_CORE_URL}/requesters/company/${encodeURIComponent(companyId)}`, {
    service: SERVICE_NAME,
    operation: "getMyRequester",
    errorMessage: "Não foi possível carregar os dados de solicitante",
  }).then((requesters) => {
    const first = requesters[0];
    return first ? { id: first.id, companyId: first.company.id } : null;
  });
}

export function listCompanyUnits(companyId: string): Promise<LocalUnit[]> {
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

export function createAddress(payload: AddressPayload): Promise<{ id: string }> {
  return httpJson<{ id: string }>(`${API_CORE_URL}/addresses`, {
    service: SERVICE_NAME,
    operation: "createAddress",
    method: "POST",
    body: payload,
    errorMessage: "Não foi possível cadastrar o endereço",
  });
}

export function createGeolocalization(addressId: string, latitude: number, longitude: number): Promise<{ id: string }> {
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

export function createUnit(payload: UnitPayload): Promise<LocalUnit> {
  return httpJson<LocalUnit>(`${API_CORE_URL}/local-units`, {
    service: SERVICE_NAME,
    operation: "createUnit",
    method: "POST",
    body: payload,
    errorMessage: "Não foi possível cadastrar a unidade",
  });
}

export function updateUnit(id: string, payload: UnitPayload): Promise<LocalUnit> {
  return httpJson<LocalUnit>(`${API_CORE_URL}/local-units/${encodeURIComponent(id)}`, {
    service: SERVICE_NAME,
    operation: "updateUnit",
    method: "PUT",
    body: payload,
    errorMessage: `Não foi possível atualizar a unidade ${id}`,
  });
}

export function deleteUnit(id: string): Promise<void> {
  return httpJson<void>(`${API_CORE_URL}/local-units/${encodeURIComponent(id)}`, {
    service: SERVICE_NAME,
    operation: "deleteUnit",
    method: "DELETE",
    errorMessage: `Não foi possível remover a unidade ${id}`,
  });
}
