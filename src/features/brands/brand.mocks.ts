import { normalizeBrand } from "./brand.utils";
import type { Brand, BrandPayload, BrandRequest } from "./brand";
import { getMockModels, saveMockModel } from "@/features/solar-panel/solarPanel.d.mocks";
import { getSelectedContext } from "@/features/access/access.onboarding.service";

const KEY = "solaria.mock.brands";
function stored(): { brands: Brand[]; requests: BrandRequest[] } {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (data && Array.isArray(data.brands) && Array.isArray(data.requests)) return data;
  } catch {
    return { brands: [], requests: [] };
  }
  return { brands: [], requests: [] };
}
const initial = stored();
const brands = new Map<string, Brand>(initial.brands.map((b) => [b.id, b]));
const requests = new Map<string, BrandRequest>(initial.requests.map((r) => [r.id, r]));
function persist() {
  localStorage.setItem(KEY, JSON.stringify({ brands: [...brands.values()], requests: [...requests.values()] }));
}
export { normalizeBrand } from "./brand.utils";
export const mockBrandId = (name: string) => `brand-${encodeURIComponent(normalizeBrand(name))}`;
export function allMockBrands() {
  for (const model of getMockModels())
    if (model.brand && (!model.brandId || model.brandId.startsWith("brand-")) && !brands.has(model.brandId ?? mockBrandId(model.brand))) {
      const id = model.brandId ?? mockBrandId(model.brand);
      brands.set(id, { id, name: model.brand, ownerCompanyId: null, visibility: "PUBLIC", archived: false, legacy: false, revision: 0 });
    }
  persist();
  return [...brands.values()];
}
function company() {
  const id = getSelectedContext();
  if (!id || id === "personal") throw new Error("Selecione uma empresa");
  return id;
}
export function ownMockBrands() {
  return allMockBrands()
    .filter((b) => b.visibility === "PUBLIC" || b.ownerCompanyId === company())
    .map((b) => ({ ...b, pending: [...requests.values()].some((r) => r.brandId === b.id && r.status === "PENDING") }));
}
export function selectedMockBrand(id: string) {
  const b = ownMockBrands().find((b) => b.id === id && !b.archived && !b.legacy);
  if (!b) throw new Error("Marca indisponível nesta empresa");
  return b;
}
function validate(d: BrandPayload) {
  if (!d.name.trim() || d.name.trim().length > 255) throw new Error("Informe o nome da marca");
  for (const value of [d.referenceUrl, d.logoUrl])
    if (value && !value.startsWith("data:image/")) {
      try {
        const u = new URL(value);
        if (!["http:", "https:"].includes(u.protocol) || u.username || u.password) throw new Error();
      } catch {
        throw new Error("Endereço inválido");
      }
    }
}
function unlocked(id: string) {
  if ([...requests.values()].some((r) => r.brandId === id && r.status === "PENDING")) throw new Error("Cancele a solicitação antes de editar");
}
export function saveMockBrand(d: BrandPayload, id?: string) {
  validate(d);
  const b = id ? brands.get(id) : undefined;
  if (id && (!b || b.ownerCompanyId !== company() || b.visibility === "PUBLIC" || b.archived)) throw new Error("Marca não pode ser editada");
  if (id) unlocked(id);
  if (
    allMockBrands().some(
      (other) => other.id !== id && !other.archived && other.ownerCompanyId === company() && normalizeBrand(other.name) === normalizeBrand(d.name),
    )
  )
    throw new Error("Sua empresa já possui essa marca");
  const saved: Brand = {
    ...b,
    ...d,
    id: id ?? crypto.randomUUID(),
    name: d.name.trim(),
    ownerCompanyId: company(),
    visibility: "PRIVATE",
    archived: false,
    legacy: false,
    revision: (b?.revision ?? -1) + 1,
  };
  brands.set(saved.id, saved);
  persist();
  return saved;
}
export function submitMockBrand(id: string, d: BrandPayload) {
  const b = selectedMockBrand(id);
  validate(d);
  unlocked(id);
  const r: BrandRequest = {
    id: crypto.randomUUID(),
    brandId: id,
    requesterCompanyId: company(),
    kind: b.visibility === "PUBLIC" ? "CORRECTION" : "PUBLICATION",
    status: "PENDING",
    proposedName: d.name.trim(),
    proposedLogoUrl: d.logoUrl,
    proposedReferenceUrl: d.referenceUrl,
    createdAt: new Date().toISOString(),
    revision: 0,
  };
  requests.set(r.id, r);
  persist();
  return r;
}
export function listMockRequests(admin: boolean) {
  return [...requests.values()].filter((r) => admin || r.requesterCompanyId === company()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function finishMockRequest(id: string, revision: number, action: "APPROVED" | "REJECTED" | "CANCELLED", reason?: string) {
  const r = requests.get(id);
  if (!r || r.status !== "PENDING" || r.revision !== revision) throw new Error("Solicitação desatualizada");
  if (action === "CANCELLED" && r.requesterCompanyId !== company()) throw new Error("Solicitação de outra empresa");
  if (action === "REJECTED" && !reason?.trim()) throw new Error("Informe o motivo da reprovação");
  const b = brands.get(r.brandId)!;
  if (action === "APPROVED") {
    const canonical = allMockBrands().find(
      (other) => other.visibility === "PUBLIC" && normalizeBrand(other.name) === normalizeBrand(r.proposedName) && other.id !== b.id,
    );
    if (canonical && r.kind === "CORRECTION") throw new Error("Já existe uma marca pública com esse nome");
    if (canonical) {
      brands.set(b.id, { ...b, archived: true });
      r.resultBrandId = canonical.id;
    } else {
      brands.set(b.id, {
        ...b,
        name: r.proposedName,
        logoUrl: r.proposedLogoUrl,
        referenceUrl: r.proposedReferenceUrl,
        visibility: "PUBLIC",
        revision: b.revision + 1,
      });
      r.resultBrandId = b.id;
    }
    for (const m of getMockModels())
      if ((m.brandId ?? mockBrandId(m.brand ?? "")) === b.id)
        saveMockModel({ ...m, brandId: r.resultBrandId, brand: canonical?.name ?? r.proposedName });
  }
  const saved = { ...r, status: action, decisionReason: reason?.trim(), revision: r.revision + 1, decidedAt: new Date().toISOString() };
  requests.set(id, saved);
  persist();
  return saved;
}
export function archiveMockBrand(id: string) {
  const b = selectedMockBrand(id);
  if (b.visibility === "PUBLIC" || b.ownerCompanyId !== company()) throw new Error("Marca pública não pode ser arquivada");
  unlocked(id);
  brands.set(id, { ...b, archived: true, revision: b.revision + 1 });
  persist();
}

export function canSelectMockModel(model: { brand?: string; brandId?: string }) {
  const id = model.brandId ?? mockBrandId(model.brand ?? "");
  const b = ownMockBrands().find((b) => b.id === id);
  return !!b && !b.archived && !b.legacy;
}
export function visibleMockModel(model: { brand?: string; brandId?: string; creatorCompanyId?: string | null }) {
  return canSelectMockModel(model) || model.creatorCompanyId === company();
}
