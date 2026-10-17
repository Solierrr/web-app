import { brandServiceError } from "./brand.utils";
import type { Brand, BrandPayload, BrandRequest } from "./brand";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import { httpJson } from "@/lib/shared/http/http.service";
import * as mocks from "./brand.mocks";
import i18n from "@/config/i18n/internationalization";
const API = import.meta.env.VITE_API_CORE;
async function request<T>(path: string, method: "GET" | "POST" | "PUT" | "DELETE", body?: unknown) {
  return httpJson<T>(`${API}/api/${path}`, { service: "brands", operation: path, method, body, errorMessage: i18n.t("brands:serviceError") }).catch(
    (error) => {
      throw brandServiceError(error);
    },
  );
}
async function run<T>(mock: () => T | Promise<T>, real: () => Promise<T>) {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return mock();
  }
  return real();
}
export const listBrands = () => run(mocks.ownMockBrands, () => request<Brand[]>("brands", "GET"));
export const createBrand = (d: BrandPayload) =>
  run(
    () => mocks.saveMockBrand(d),
    () => request<Brand>("brands", "POST", d),
  );
export const updateBrand = (id: string, d: BrandPayload) =>
  run(
    () => mocks.saveMockBrand(d, id),
    () => request<Brand>(`brands/${id}`, "PUT", d),
  );
export const archiveBrand = (id: string) =>
  run(
    () => mocks.archiveMockBrand(id),
    () => request<void>(`brands/${id}`, "DELETE"),
  );
export const submitBrand = (id: string, d: BrandPayload) =>
  run(
    () => mocks.submitMockBrand(id, d),
    () => request<BrandRequest>(`brands/${id}/requests`, "POST", d),
  );
export const listBrandRequests = (admin = false) =>
  run(
    () => mocks.listMockRequests(admin),
    () => request<BrandRequest[]>(admin ? "brand-review" : "brand-requests", "GET"),
  );
export const cancelBrandRequest = (r: BrandRequest) =>
  run(
    () => mocks.finishMockRequest(r.id, r.revision, "CANCELLED"),
    () => request<BrandRequest>(`brand-requests/${r.id}/cancel`, "POST", { revision: r.revision }),
  );
export const decideBrandRequest = (r: BrandRequest, approved: boolean, reason?: string) =>
  run(
    () => mocks.finishMockRequest(r.id, r.revision, approved ? "APPROVED" : "REJECTED", reason),
    () => request<BrandRequest>(`brand-review/${r.id}/decision?approved=${approved}`, "POST", { revision: r.revision, reason }),
  );
export const uploadBrandLogo = (file: File) =>
  run(
    () =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => resolve(String(reader.result));
        reader.readAsDataURL(file);
      }),
    async () => {
      const body = new FormData();
      body.set("file", file);
      return (await request<{ url: string }>("brands/logo", "POST", body)).url;
    },
  );
