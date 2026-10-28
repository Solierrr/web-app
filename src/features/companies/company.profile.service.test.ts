import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { httpJson } from "@/lib/shared/http/http.service";
import { updateMyCompanyProfile } from "./company.service";
vi.mock("@/lib/shared/http/http.service", () => ({ httpJson: vi.fn() }));
vi.mock("@/features/users/user/user.service", () => ({ getMyUser: vi.fn().mockResolvedValue({ id: "user" }) }));
vi.mock("@/features/access/access.onboarding.service", () => ({ getSelectedContext: () => "company" }));
const address = {
  id: "address",
  street: "Rua A",
  number: "1",
  neighborhood: "Centro",
  city: "Cidade",
  state: "SP",
  zipCode: "12345678",
  country: "",
};
const profile = { tradeName: "Empresa", corporateName: "Empresa Ltda", businessContact: { companyEmail: "contact@example.test" }, address };
beforeEach(() => {
  vi.stubEnv("VITE_MOCKS", "DEACTIVATED");
  vi.mocked(httpJson)
    .mockReset()
    .mockImplementation(async (url, options) => {
      if (String(url).endsWith("/me/all")) return [{ companyId: "company", position: { id: "position", name: "ADMIN" } }];
      if (options.method === "GET" || options.method === undefined) return { id: "company", ...profile };
      if (String(url).includes("/addresses")) return { id: "address" };
      return { id: "company", ...profile };
    });
});
afterEach(() => vi.unstubAllEnvs());
describe("company profile integration", () => {
  it("preserves the address id when only company data changes", async () => {
    await updateMyCompanyProfile("company", { ...profile, tradeName: "Novo nome" });
    expect(httpJson).toHaveBeenCalledWith(
      expect.stringContaining("/companies/company"),
      expect.objectContaining({ method: "PUT", body: expect.objectContaining({ addressId: "address", tradeName: "Novo nome" }) }),
    );
    expect(vi.mocked(httpJson).mock.calls.some(([url]) => String(url).includes("/addresses"))).toBe(false);
  });
  it("updates an existing address and reuses its id", async () => {
    await updateMyCompanyProfile("company", { ...profile, address: { ...address, street: "Rua B" } });
    expect(httpJson).toHaveBeenCalledWith(
      expect.stringContaining("/addresses/address"),
      expect.objectContaining({ method: "PUT", body: expect.objectContaining({ street: "Rua B" }) }),
    );
  });
  it("refuses updates to another company", async () => {
    await expect(updateMyCompanyProfile("another", profile)).rejects.toThrow();
    expect(vi.mocked(httpJson).mock.calls.some(([, options]) => options.method === "PUT")).toBe(false);
  });
  it("includes the introduction in the authorized company update", async () => {
    await updateMyCompanyProfile("company", { ...profile, description: "Planejamento e equipamentos." });
    expect(httpJson).toHaveBeenCalledWith(
      expect.stringContaining("/companies/company"),
      expect.objectContaining({ method: "PUT", body: expect.objectContaining({ description: "Planejamento e equipamentos." }) }),
    );
  });
});
