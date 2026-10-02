import { describe, expect, it } from "vitest";
import type { Offer } from "./offer.service";
import { getOfferStatus } from "./offer.utils";

const offer = { availability: 5, expirationDate: null } as Offer;

describe("getOfferStatus", () => {
  it("is active while there is stock and no expiration in the past", () => {
    expect(getOfferStatus(offer)).toBe("ACTIVE");
    expect(getOfferStatus({ ...offer, expirationDate: "2999-01-01T00:00:00Z" })).toBe("ACTIVE");
  });

  it("is paused when the stock is zero", () => {
    expect(getOfferStatus({ ...offer, availability: 0 })).toBe("PAUSED");
  });

  it("is closed once the expiration date has passed, even without stock", () => {
    expect(getOfferStatus({ ...offer, expirationDate: "2020-01-01T00:00:00Z" })).toBe("CLOSED");
    expect(getOfferStatus({ ...offer, availability: 0, expirationDate: "2020-01-01T00:00:00Z" })).toBe("CLOSED");
  });
});
