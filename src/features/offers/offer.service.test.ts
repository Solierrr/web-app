import { describe, expect, it, vi } from "vitest";
import { changeOfferStatus, createOffer, deleteOffer, getMySupplier, listCompanyOffers, updateOffer, type Offer } from "./offer.service";
import { httpJson } from "@/lib/shared/http/http.service";

vi.mock("@/lib/shared/http/http.service", () => ({ httpJson: vi.fn() }));

describe("offer.service", () => {
  it("returns the first supplier for a company", async () => {
    vi.mocked(httpJson).mockResolvedValue([{ id: "supplier-1", companyId: "company-1" }]);
    await expect(getMySupplier("company-1")).resolves.toEqual({ id: "supplier-1", companyId: "company-1" });
  });

  it("returns null when the company has no supplier record", async () => {
    vi.mocked(httpJson).mockResolvedValue([]);
    await expect(getMySupplier("company-1")).resolves.toBeNull();
  });

  it("lists offers for a company", async () => {
    vi.mocked(httpJson).mockResolvedValue([]);
    await listCompanyOffers("company-1");
    expect(httpJson).toHaveBeenCalledWith(expect.stringContaining("/offers/company/company-1"), expect.anything());
  });

  it("creates an offer", async () => {
    vi.mocked(httpJson).mockResolvedValue({ id: "offer-1" });
    await createOffer({ supplierId: "supplier-1", modelId: "model-1", title: "Placa X", description: "desc", unitPrice: 100, availability: 5 });
    expect(httpJson).toHaveBeenCalledWith(expect.stringContaining("/offers"), expect.objectContaining({ method: "POST" }));
  });

  it("updates an offer", async () => {
    vi.mocked(httpJson).mockResolvedValue({ id: "offer-1" });
    await updateOffer("offer-1", {
      supplierId: "supplier-1",
      modelId: "model-1",
      title: "Placa X",
      description: "desc",
      unitPrice: 120,
      availability: 3,
    });
    expect(httpJson).toHaveBeenCalledWith(expect.stringContaining("/offers/offer-1"), expect.objectContaining({ method: "PUT" }));
  });

  it("deletes an offer", async () => {
    vi.mocked(httpJson).mockResolvedValue(undefined);
    await deleteOffer("offer-1");
    expect(httpJson).toHaveBeenCalledWith(expect.stringContaining("/offers/offer-1"), expect.objectContaining({ method: "DELETE" }));
  });

  describe("changeOfferStatus", () => {
    const offer: Offer = {
      id: "offer-1",
      supplierId: "supplier-1",
      model: { id: "model-1", brand: "SolarTech", model: "ST-450W" },
      slug: "placa",
      unitPrice: 899.9,
      availability: 10,
      expirationDate: null,
      discountPercentage: 5,
      serviceRegions: ["SP"],
      translationStatus: "COMPLETED",
      translations: [{ locale: "pt-BR", title: "Painel", description: "desc", details: null }],
    };

    function sentBody() {
      return (vi.mocked(httpJson).mock.calls.at(-1)?.[1] as { body: Record<string, unknown> }).body;
    }

    it("pauses by zeroing the stock and remembers it to resume later", async () => {
      localStorage.clear();
      vi.mocked(httpJson).mockResolvedValue(offer);

      await changeOfferStatus(offer, "PAUSED");
      expect(sentBody()).toMatchObject({ availability: 0, modelId: "model-1", title: "Painel", discountPercentage: 5 });

      await changeOfferStatus({ ...offer, availability: 0 }, "ACTIVE");
      expect(sentBody().availability).toBe(10);
    });

    it("reopens a paused offer without a remembered stock with a single unit", async () => {
      localStorage.clear();
      vi.mocked(httpJson).mockResolvedValue(offer);

      await changeOfferStatus({ ...offer, availability: 0 }, "ACTIVE");

      expect(sentBody().availability).toBe(1);
    });

    it("still sends the change when the browser storage is unavailable", async () => {
      vi.mocked(httpJson).mockResolvedValue(offer);
      const failing = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("blocked");
      });
      const reading = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("blocked");
      });

      await changeOfferStatus(offer, "PAUSED");
      expect(sentBody().availability).toBe(0);
      await changeOfferStatus({ ...offer, availability: 0 }, "ACTIVE");
      expect(sentBody().availability).toBe(1);

      failing.mockRestore();
      reading.mockRestore();
    });

    it("closes by expiring the offer now and reopens with a future date", async () => {
      vi.mocked(httpJson).mockResolvedValue(offer);

      await changeOfferStatus(offer, "CLOSED");
      expect(Date.parse(String(sentBody().expirationDate))).toBeLessThanOrEqual(Date.now());

      await changeOfferStatus({ ...offer, expirationDate: "2020-01-01T00:00:00Z" }, "ACTIVE");
      expect(Date.parse(String(sentBody().expirationDate))).toBeGreaterThan(Date.now());
    });
  });
});
