import { httpJson } from "@/lib/shared/http/http.service";
import { API_CORE_URL } from "@/lib/shared/http/apiCore.utils";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import { getMockOffers, saveMockOffer, deleteMockOffer } from "./offer.d.mocks";

const SERVICE_NAME = "offer";

export interface OfferModel {
  id: string;
  brand: string;
  model: string;
}

export interface Offer {
  id: string;
  supplierId: string;
  model: OfferModel;
  slug: string;
  unitPrice: number;
  availability: number;
  expirationDate: string | null;
  discountPercentage: number | null;
  serviceRegions: string[] | null;
  translationStatus: string;
  translations: { locale: string; title: string; description: string; details: string | null }[];
}

export interface Supplier {
  id: string;
  companyId: string;
}

export async function getMySupplier(companyId: string): Promise<Supplier | null> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return { id: companyId, companyId };
  }
  return httpJson<Supplier[]>(`${API_CORE_URL}/suppliers/company/${encodeURIComponent(companyId)}`, {
    service: SERVICE_NAME,
    operation: "getMySupplier",
    errorMessage: "Não foi possível carregar os dados de fornecedor",
  }).then((suppliers) => suppliers[0] ?? null);
}

export async function listCompanyOffers(companyId: string): Promise<Offer[]> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return getMockOffers(companyId);
  }
  return httpJson<Offer[]>(`${API_CORE_URL}/offers/company/${encodeURIComponent(companyId)}`, {
    service: SERVICE_NAME,
    operation: "listCompanyOffers",
    errorMessage: "Não foi possível carregar as ofertas",
  });
}

export interface OfferPayload {
  supplierId: string;
  modelId: string;
  title: string;
  description: string;
  details?: string;
  unitPrice: number;
  availability: number;
  expirationDate?: string;
  discountPercentage?: number;
  serviceRegions?: string[];
}

export async function createOffer(payload: OfferPayload): Promise<Offer> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return saveMockOffer(payload);
  }
  return httpJson<Offer>(`${API_CORE_URL}/offers`, {
    service: SERVICE_NAME,
    operation: "createOffer",
    method: "POST",
    body: payload,
    errorMessage: "Não foi possível criar a oferta",
  });
}

// OfferRequestDTO exige title/description não-vazios mesmo na atualização
// (a API ignora esses dois campos no update — só a tradução "PENDING" do
// cadastro é usada — mas a validação do DTO ainda os exige no corpo).
export async function updateOffer(id: string, payload: OfferPayload): Promise<Offer> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return saveMockOffer(payload, id);
  }
  return httpJson<Offer>(`${API_CORE_URL}/offers/${encodeURIComponent(id)}`, {
    service: SERVICE_NAME,
    operation: "updateOffer",
    method: "PUT",
    body: payload,
    errorMessage: `Não foi possível atualizar a oferta ${id}`,
  });
}

export async function deleteOffer(id: string): Promise<void> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    deleteMockOffer(id);
    return;
  }
  return httpJson<void>(`${API_CORE_URL}/offers/${encodeURIComponent(id)}`, {
    service: SERVICE_NAME,
    operation: "deleteOffer",
    method: "DELETE",
    errorMessage: `Não foi possível remover a oferta ${id}`,
  });
}
