import { describe, expect, it, vi } from "vitest";
import { changeOfferStatus, createOffer, deleteOffer, getMySupplier, listCompanyOffers, updateOffer, type Offer } from "./offer.service";
import { httpJson } from "@/lib/shared/http/http.service";

vi.mock("@/lib/shared/http/http.service", () => ({ httpJson: vi.fn() }));
vi.mock("@/config/mocks/mockMode.utils", () => ({ isAlwaysMockMode: () => false }));

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

    it("changes status without changing stock, dates or source texts", async () => {
      vi.mocked(httpJson).mockResolvedValue({ commercialStatus: "PAUSED" });
      const result = await changeOfferStatus(offer, "PAUSED");
      expect(sentBody()).toEqual({ status: "PAUSED" });
      expect(result.availability).toBe(10);
      expect(result.expirationDate).toBeNull();
      expect(result.translations).toEqual(offer.translations);
      expect(result.commercialStatus).toBe("PAUSED");
      expect(httpJson).toHaveBeenLastCalledWith(expect.stringContaining("/offers/offer-1/status"), expect.objectContaining({ method: "PATCH" }));
    });
    it("closes through the lifecycle endpoint", async () => {
      vi.mocked(httpJson).mockResolvedValue({ commercialStatus: "CLOSED" });
      expect((await changeOfferStatus(offer, "CLOSED")).commercialStatus).toBe("CLOSED");
      expect(sentBody()).toEqual({ status: "CLOSED" });
    });
  });
});
