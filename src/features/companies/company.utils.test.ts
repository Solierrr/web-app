import { describe, expect, it } from "vitest";
import { CompanyStatus } from "./company.enum";
import { getRegistrationStage } from "./company.utils";

describe("getRegistrationStage", () => {
  it("maps the backend status to the stage shown to the registrant", () => {
    expect(getRegistrationStage(CompanyStatus.UNDERANALYSIS)).toBe("MANUAL_REVIEW");
    expect(getRegistrationStage(CompanyStatus.APPROVED)).toBe("APPROVED");
    expect(getRegistrationStage(CompanyStatus.REJECTED)).toBe("REJECTED");
  });
});
