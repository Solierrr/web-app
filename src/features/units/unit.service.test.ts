import { describe, expect, it, vi } from "vitest";
import { createGeolocalization, createUnit, deleteUnit, getMyRequester, listCompanyUnits, updateUnit } from "./unit.service";
import { httpJson } from "@/lib/shared/http/http.service";

vi.mock("@/lib/shared/http/http.service", () => ({ httpJson: vi.fn() }));

describe("unit.service", () => {
  it("returns the first requester for a company", async () => {
    vi.mocked(httpJson).mockResolvedValue([{ id: "requester-1", company: { id: "company-1" } }]);
    await expect(getMyRequester("company-1")).resolves.toEqual({ id: "requester-1", companyId: "company-1" });
  });

  it("returns null when the company has no requester record", async () => {
    vi.mocked(httpJson).mockResolvedValue([]);
    await expect(getMyRequester("company-1")).resolves.toBeNull();
  });

  it("lists units for a company", async () => {
    vi.mocked(httpJson).mockResolvedValue([]);
    await listCompanyUnits("company-1");
    expect(httpJson).toHaveBeenCalledWith(expect.stringContaining("/local-units/company/company-1"), expect.anything());
  });

  it("creates a geolocalization for an address", async () => {
    vi.mocked(httpJson).mockResolvedValue({ id: "geo-1" });
    await createGeolocalization("address-1", -23.5, -46.6);
    expect(httpJson).toHaveBeenCalledWith(expect.stringContaining("/geolocalizations"), expect.objectContaining({
      method: "POST", body: { addressId: "address-1", latitude: -23.5, longitude: -46.6 },
    }));
  });

  it("creates a unit", async () => {
    vi.mocked(httpJson).mockResolvedValue({ id: "unit-1" });
    await createUnit({ requesterId: "requester-1", addressId: "address-1", locationType: "HOUSE" });
    expect(httpJson).toHaveBeenCalledWith(expect.stringContaining("/local-units"), expect.objectContaining({ method: "POST" }));
  });

  it("updates a unit", async () => {
    vi.mocked(httpJson).mockResolvedValue({ id: "unit-1" });
    await updateUnit("unit-1", { requesterId: "requester-1", addressId: "address-1", locationType: "BUILDING" });
    expect(httpJson).toHaveBeenCalledWith(expect.stringContaining("/local-units/unit-1"), expect.objectContaining({ method: "PUT" }));
  });

  it("deletes a unit", async () => {
    vi.mocked(httpJson).mockResolvedValue(undefined);
    await deleteUnit("unit-1");
    expect(httpJson).toHaveBeenCalledWith(expect.stringContaining("/local-units/unit-1"), expect.objectContaining({ method: "DELETE" }));
  });
});
