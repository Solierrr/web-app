import { selectedMockBrand, mockBrandId } from "@/features/brands/brand.mocks";
import { getMockModels } from "@/features/solar-panel/solarPanel.d.mocks";
import i18n from "@/config/i18n/internationalization";
import { httpJson } from "@/lib/shared/http/http.service";
import { API_CORE_URL } from "@/lib/shared/http/apiCore.utils";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import { getMockOffers, saveMockOffer, deleteMockOffer, setMockOfferStatus } from "./offer.d.mocks";
import type { OfferStatus } from "./offer.utils";

const SERVICE_NAME = "offer";

export interface OfferModel {
  id: string;
  brand: string;
  model: string;
}

export interface Offer {
  commercialStatus?: OfferStatus;
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
  sourceLocale?: string | null;
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
    errorMessage: i18n.t("services:offer.getMySupplier"),
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
    errorMessage: i18n.t("services:offer.listCompanyOffers"),
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
    const model = getMockModels().find((m) => m.id === payload.modelId);
    if (!model) throw new Error("Modelo indisponível");
    selectedMockBrand(model.brandId ?? mockBrandId(model.brand ?? ""));
    return saveMockOffer(payload);
  }
  return httpJson<Offer>(`${API_CORE_URL}/offers`, {
    service: SERVICE_NAME,
    operation: "createOffer",
    method: "POST",
    body: payload,
    errorMessage: i18n.t("services:offer.createOffer"),
  });
}

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
    errorMessage: i18n.t("services:offer.updateOffer", { id }),
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
    errorMessage: i18n.t("services:offer.deleteOffer", { id }),
  });
}

export async function changeOfferStatus(offer: Offer, status: OfferStatus): Promise<Offer> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return setMockOfferStatus(offer, status);
  }
  const result = await httpJson<{ commercialStatus: OfferStatus }>(`${API_CORE_URL}/offers/${encodeURIComponent(offer.id)}/status`, {
    service: SERVICE_NAME,
    operation: "changeOfferStatus",
    method: "PATCH",
    body: { status },
    errorMessage: i18n.t("services:offer.updateOffer", { id: offer.id }),
  });
  return { ...offer, commercialStatus: result.commercialStatus };
}
