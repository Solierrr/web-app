import { describe, expect, it, vi } from "vitest";
import { getCatalogSolarPanels } from "./solarPanel.service";
import { httpJson } from "@/lib/shared/http/http.service";
import { DEFAULT } from "@/config/i18n/browser/languages";
vi.mock("@/lib/shared/http/http.service", () => ({ httpJson: vi.fn() }));
describe("Catalog product mapping", () => {
  it("preserves infrastructure attributes without inventing solar panel measurements", async () => {
    vi.mocked(httpJson).mockResolvedValue([
      {
        id: "rail",
        slug: "rail",
        companyId: "c",
        companySlug: "company",
        companyTradeName: "Company",
        title: "Trilho",
        description: "",
        details: "",
        modelId: "model",
        brand: "Brand",
        model: "Rail",
        productType: "INFRASTRUCTURE",
        infrastructureType: "RAIL",
        material: "Alumínio",
        type: null,
        powerWp: null,
        efficiency: null,
        width: null,
        length: null,
        weight: null,
        unitPrice: 80,
        discountPercentage: null,
        availability: 2,
        serviceRegions: [],
        photoUrls: ["https://res.cloudinary.com/solaria/image/upload/mocks/infrastructure-d9a5baac44f0.webp"],
      },
    ]);
    const [offer] = await getCatalogSolarPanels(DEFAULT, "INFRASTRUCTURE");
    expect(httpJson).toHaveBeenCalledWith(expect.stringContaining("productType=INFRASTRUCTURE"), expect.objectContaining({ authenticated: false }));
    expect(offer.panel).toMatchObject({ productType: "INFRASTRUCTURE", infrastructureType: "RAIL", material: "Alumínio" });
    expect(offer.panel.type).toBeUndefined();
    expect(offer.panel.dimension).toBeUndefined();
    expect(offer.panel.powerOutput).toBeUndefined();
  });
});
