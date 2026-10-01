import { describe, expect, it } from "vitest";
import { getOperationalNavigation } from "./SaaSLayout.presets";

const keys = (options: Parameters<typeof getOperationalNavigation>[0]) =>
  getOperationalNavigation(options).flatMap((group) => group.items.map((item) => item.key));

describe("getOperationalNavigation", () => {
  it("offers the registration status only while the company registration is pending", () => {
    expect(keys({ company: true, companyType: null, platformAdmin: false, pendingRegistration: true })).toContain("registrationStatus");
    expect(keys({ company: true, companyType: "SUPPLIER", platformAdmin: false })).not.toContain("registrationStatus");
  });

  it("limits a personal profile to the overview items", () => {
    expect(keys({ company: false, companyType: null, platformAdmin: false })).toEqual(["dashboard", "messages"]);
  });

  it("hides supplier management items the user cannot read", () => {
    const result = keys({ company: true, companyType: "SUPPLIER", platformAdmin: false, can: (permission) => permission === "GET /api/models" });

    expect(result).toContain("solarPanelModels");
    expect(result).not.toContain("offers");
  });

  it("adds the administration group for a platform admin", () => {
    expect(keys({ company: false, companyType: null, platformAdmin: true })).toContain("registrations");
  });

  it("offers the analytics page only to the platform admin or to members who can read something", () => {
    expect(keys({ company: false, companyType: null, platformAdmin: true })).toContain("analytics");
    expect(keys({ company: true, companyType: "SUPPLIER", platformAdmin: false })).toContain("analytics");
    expect(keys({ company: true, companyType: "SUPPLIER", platformAdmin: false, can: () => false })).not.toContain("analytics");
    expect(keys({ company: false, companyType: null, platformAdmin: false })).not.toContain("analytics");
  });
});
