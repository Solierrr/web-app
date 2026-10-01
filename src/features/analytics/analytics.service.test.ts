import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCompanyKpis, getPlatformKpis } from "./analytics.service";
import { listAllCompanies } from "@/features/companies/company.service";
import { listEmployees } from "@/features/companies/company.management.service";
import { listCompanyOffers } from "@/features/offers/offer.service";
import { listProfessionalReviews } from "@/features/professionals/review/review.service";
import { listSolarPanelModels, listSolarPanelModelsByStatus } from "@/features/solar-panel/solarPanel.service";
import { listCompanyUnits } from "@/features/units/unit.service";

vi.mock("@/features/companies/company.service", () => ({ listAllCompanies: vi.fn() }));
vi.mock("@/features/companies/company.management.service", () => ({ listEmployees: vi.fn() }));
vi.mock("@/features/offers/offer.service", () => ({ listCompanyOffers: vi.fn() }));
vi.mock("@/features/professionals/review/review.service", () => ({ listProfessionalReviews: vi.fn() }));
vi.mock("@/features/solar-panel/solarPanel.service", () => ({ listSolarPanelModels: vi.fn(), listSolarPanelModelsByStatus: vi.fn() }));
vi.mock("@/features/units/unit.service", () => ({ listCompanyUnits: vi.fn() }));

const offer = (availability: number, expirationDate: string | null) => ({ availability, expirationDate }) as never;
const everything = () => true;

describe("analytics.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("counts companies, models and professionals for the platform", async () => {
    vi.mocked(listAllCompanies).mockResolvedValue([{ status: "APPROVED" }, { status: "APPROVED" }, { status: "UNDER_ANALYSIS" }] as never);
    vi.mocked(listSolarPanelModelsByStatus).mockImplementation(async (status) => (status === "APPROVED" ? [{}, {}, {}] : [{}]) as never);
    vi.mocked(listProfessionalReviews).mockResolvedValue([{ status: "UNDER_ANALYSIS" }, { status: "APPROVED" }] as never);

    const result = await getPlatformKpis();

    expect(result.failed).toBe(false);
    expect(Object.fromEntries(result.kpis.map((kpi) => [kpi.key, kpi.value]))).toEqual({
      approvedCompanies: 2,
      pendingCompanies: 1,
      approvedModels: 3,
      pendingModels: 1,
      pendingProfessionals: 1,
    });
  });

  it("keeps the indicators that loaded and flags the ones that failed", async () => {
    vi.mocked(listAllCompanies).mockRejectedValue(new Error("403"));
    vi.mocked(listSolarPanelModelsByStatus).mockResolvedValue([{}] as never);
    vi.mocked(listProfessionalReviews).mockResolvedValue([]);

    const result = await getPlatformKpis();

    expect(result.failed).toBe(true);
    expect(result.kpis.map((kpi) => kpi.key)).toEqual(["approvedModels", "pendingModels", "pendingProfessionals"]);
  });

  it("splits supplier offers by status and counts models and employees", async () => {
    vi.mocked(listCompanyOffers).mockResolvedValue([offer(5, null), offer(0, null), offer(5, "2020-01-01T00:00:00Z"), offer(2, null)]);
    vi.mocked(listSolarPanelModels).mockResolvedValue([{}, {}] as never);
    vi.mocked(listEmployees).mockResolvedValue([{}] as never);

    const result = await getCompanyKpis({ id: "c1", type: "SUPPLIER" } as never, everything);

    expect(Object.fromEntries(result.kpis.map((kpi) => [kpi.key, kpi.value]))).toEqual({
      activeOffers: 2,
      pausedOffers: 1,
      closedOffers: 1,
      models: 2,
      employees: 1,
    });
    expect(listCompanyUnits).not.toHaveBeenCalled();
  });

  it("counts units for a demandant and skips what the user cannot read", async () => {
    vi.mocked(listCompanyUnits).mockResolvedValue([{}, {}, {}] as never);

    const result = await getCompanyKpis({ id: "c1", type: "DEMANDANT" } as never, (permission) => permission.includes("local-units"));

    expect(result.kpis).toEqual([{ key: "units", value: 3 }]);
    expect(listEmployees).not.toHaveBeenCalled();
    expect(listCompanyOffers).not.toHaveBeenCalled();
  });
});
