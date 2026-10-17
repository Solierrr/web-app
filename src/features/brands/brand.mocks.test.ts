import { beforeEach, describe, expect, it, vi } from "vitest";
const context = vi.hoisted(() => ({ id: "company-a" }));
vi.mock("@/features/access/access.onboarding.service", () => ({ getSelectedContext: () => context.id }));
vi.mock("@/features/solar-panel/solarPanel.d.mocks", () => ({ getMockModels: () => [], saveMockModel: vi.fn() }));
let api: typeof import("./brand.mocks");
beforeEach(async () => {
  localStorage.clear();
  context.id = "company-a";
  vi.resetModules();
  api = await import("./brand.mocks");
});
describe("brand catalog preview", () => {
  it("isolates private selection and prevents forged model references", () => {
    const b = api.saveMockBrand({ name: "Privada" });
    context.id = "company-b";
    expect(api.ownMockBrands()).toEqual([]);
    expect(() => api.selectedMockBrand(b.id)).toThrow();
    expect(api.canSelectMockModel({ brandId: b.id })).toBe(false);
  });
  it("keeps private use while review locks edits and cancellation unlocks", () => {
    const b = api.saveMockBrand({ name: "Privada" });
    const r = api.submitMockBrand(b.id, { name: b.name });
    expect(api.selectedMockBrand(b.id).pending).toBe(true);
    expect(() => api.saveMockBrand({ name: "Alterada" }, b.id)).toThrow();
    api.finishMockRequest(r.id, r.revision, "CANCELLED");
    expect(api.saveMockBrand({ name: "Alterada" }, b.id).name).toBe("Alterada");
    expect(() => api.finishMockRequest(r.id, r.revision, "APPROVED")).toThrow();
  });
  it("requires rejection reason and preserves private visibility", () => {
    const b = api.saveMockBrand({ name: "Privada" });
    const r = api.submitMockBrand(b.id, { name: b.name });
    expect(() => api.finishMockRequest(r.id, r.revision, "REJECTED", " ")).toThrow();
    api.finishMockRequest(r.id, r.revision, "REJECTED", "Referência insuficiente");
    expect(api.selectedMockBrand(b.id).visibility).toBe("PRIVATE");
  });
  it("publishes globally, blocks public archive and applies corrections only after review", () => {
    const b = api.saveMockBrand({ name: "Original" });
    let r = api.submitMockBrand(b.id, { name: b.name });
    api.finishMockRequest(r.id, r.revision, "APPROVED");
    context.id = "company-b";
    expect(api.selectedMockBrand(b.id).visibility).toBe("PUBLIC");
    expect(() => api.archiveMockBrand(b.id)).toThrow();
    r = api.submitMockBrand(b.id, { name: "Corrigida" });
    expect(api.selectedMockBrand(b.id).name).toBe("Original");
    api.finishMockRequest(r.id, r.revision, "APPROVED");
    expect(api.selectedMockBrand(b.id).name).toBe("Corrigida");
  });
  it("reuses a canonical public name without making duplicate brands public", () => {
    const a = api.saveMockBrand({ name: "Solar" });
    let r = api.submitMockBrand(a.id, { name: a.name });
    api.finishMockRequest(r.id, r.revision, "APPROVED");
    context.id = "company-b";
    const b = api.saveMockBrand({ name: " SOLAR " });
    r = api.submitMockBrand(b.id, { name: b.name });
    const result = api.finishMockRequest(r.id, r.revision, "APPROVED");
    expect(result.resultBrandId).toBe(a.id);
    expect(api.ownMockBrands().filter((b) => b.visibility === "PUBLIC")).toHaveLength(1);
  });
  it("keeps private ownership and requests across module reloads", async () => {
    const b = api.saveMockBrand({ name: "Persistente" });
    api.submitMockBrand(b.id, { name: b.name });
    vi.resetModules();
    api = await import("./brand.mocks");
    context.id = "company-b";
    expect(api.ownMockBrands()).toEqual([]);
    expect(api.listMockRequests(false)).toEqual([]);
    context.id = "company-a";
    expect(api.selectedMockBrand(b.id).pending).toBe(true);
    expect(api.listMockRequests(false)).toHaveLength(1);
  });
  it("rejects cancellation by another company and archival prevents new selection", () => {
    const b = api.saveMockBrand({ name: "Privada" });
    const r = api.submitMockBrand(b.id, { name: b.name });
    context.id = "company-b";
    expect(() => api.finishMockRequest(r.id, r.revision, "CANCELLED")).toThrow();
    context.id = "company-a";
    api.finishMockRequest(r.id, r.revision, "CANCELLED");
    api.archiveMockBrand(b.id);
    expect(api.canSelectMockModel({ brandId: b.id })).toBe(false);
  });
});
