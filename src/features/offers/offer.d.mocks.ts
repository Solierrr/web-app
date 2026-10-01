import { solarPanelAnnouncementMocks } from "@/config/mocks/registry";
import { getSelectedContext } from "@/features/access/access.onboarding.service";
import type { Offer, OfferPayload } from "./offer.service";

function key(companyId: string): string {
  return `solaria.mock.offers.${companyId}`;
}

export function getMockOffers(companyId: string): Offer[] {
  const raw = localStorage.getItem(key(companyId));
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return solarPanelAnnouncementMocks.slice(0, 3).map((item) => ({
    id: item.id,
    supplierId: companyId,
    model: { id: item.panel.id, brand: item.panel.brand ?? "", model: item.panel.model ?? "" },
    slug: item.slug,
    unitPrice: item.unitPrice,
    availability: item.availableUnits ?? 0,
    expirationDate: null,
    discountPercentage: item.discountPercentage ?? null,
    serviceRegions: item.serviceRegions ?? [],
    translationStatus: "COMPLETED",
    translations: [{ locale: "pt-BR", title: item.title, description: item.description ?? item.title, details: null }],
  }));
}

export function saveMockOffer(payload: OfferPayload, id: string = crypto.randomUUID()): Offer {
  const companyId = getSelectedContext() ?? payload.supplierId;
  const items = getMockOffers(companyId);
  const panel = solarPanelAnnouncementMocks.find((item) => item.panel.id === payload.modelId)?.panel;
  const offer: Offer = {
    id,
    supplierId: payload.supplierId,
    model: { id: payload.modelId, brand: panel?.brand ?? "", model: panel?.model ?? "" },
    slug: id,
    unitPrice: payload.unitPrice,
    availability: payload.availability,
    expirationDate: payload.expirationDate ?? null,
    discountPercentage: payload.discountPercentage ?? null,
    serviceRegions: payload.serviceRegions ?? [],
    translationStatus: "COMPLETED",
    translations: [{ locale: "pt-BR", title: payload.title, description: payload.description, details: payload.details ?? null }],
  };
  localStorage.setItem(key(companyId), JSON.stringify([...items.filter((item) => item.id !== id), offer]));
  return offer;
}

export function deleteMockOffer(id: string): void {
  const companyId = getSelectedContext() ?? "mock-company";
  localStorage.setItem(key(companyId), JSON.stringify(getMockOffers(companyId).filter((item) => item.id !== id)));
}
