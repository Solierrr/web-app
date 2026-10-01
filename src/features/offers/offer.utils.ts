import type { Offer } from "./offer.service";

export type OfferStatus = "ACTIVE" | "PAUSED" | "CLOSED";

export function getOfferStatus(offer: Offer, now = Date.now()): OfferStatus {
  if (offer.expirationDate && Date.parse(offer.expirationDate) <= now) return "CLOSED";
  return offer.availability === 0 ? "PAUSED" : "ACTIVE";
}
