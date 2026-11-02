import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCompanyDashboard, getPlatformDashboard } from "./analytics.service";
import { httpJson } from "@/lib/shared/http/http.service";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";

vi.mock("@/lib/shared/http/http.service", () => ({ httpJson: vi.fn() }));
vi.mock("@/config/mocks/mockMode.utils", () => ({ isAlwaysMockMode: vi.fn() }));
vi.mock("@/lib/shared/http/apiCore.utils", () => ({ API_CORE_URL: "http://core/api" }));

describe("analytics service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isAlwaysMockMode).mockReturnValue(false);
  });

  it("requests the platform dashboard", async () => {
    vi.mocked(httpJson).mockResolvedValue({ scope: "PLATFORM" });

    await expect(getPlatformDashboard()).resolves.toEqual({ scope: "PLATFORM" });

    expect(httpJson).toHaveBeenCalledWith("http://core/api/analytics/platform", expect.objectContaining({ operation: "getPlatformDashboard" }));
  });

  it("requests a company dashboard by id, encoding the id", async () => {
    vi.mocked(httpJson).mockResolvedValue({ scope: "SUPPLIER" });

    await getCompanyDashboard("a/b", "SUPPLIER");

    expect(httpJson).toHaveBeenCalledWith("http://core/api/analytics/companies/a%2Fb", expect.objectContaining({ operation: "getCompanyDashboard" }));
  });

  it("serves fixtures in mock mode without calling the API", async () => {
    vi.mocked(isAlwaysMockMode).mockReturnValue(true);

    expect((await getPlatformDashboard()).scope).toBe("PLATFORM");
    expect((await getCompanyDashboard("c1", "SUPPLIER")).scope).toBe("SUPPLIER");
    expect((await getCompanyDashboard("c2", "DEMANDANT")).scope).toBe("REQUESTER");
    expect(httpJson).not.toHaveBeenCalled();
  });
});
