import { describe, expect, it, vi } from "vitest";
import { createOffer, deleteOffer, getMySupplier, listCompanyOffers, updateOffer } from "./offer.service";
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
    await updateOffer("offer-1", { supplierId: "supplier-1", modelId: "model-1", title: "Placa X", description: "desc", unitPrice: 120, availability: 3 });
    expect(httpJson).toHaveBeenCalledWith(expect.stringContaining("/offers/offer-1"), expect.objectContaining({ method: "PUT" }));
  });

  it("deletes an offer", async () => {
    vi.mocked(httpJson).mockResolvedValue(undefined);
    await deleteOffer("offer-1");
    expect(httpJson).toHaveBeenCalledWith(expect.stringContaining("/offers/offer-1"), expect.objectContaining({ method: "DELETE" }));
  });
});
