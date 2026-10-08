import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteMockModel, getMockModels } from "./solarPanel.d.mocks";
import { SolarPanelModelStatus } from "./solarPanel.enum";

vi.mock("@/config/mocks/registry", () => ({
  solarPanelAnnouncementMocks: [{ panel: { id: "approved-model", model: "Solar 450", status: "APPROVED" } }],
}));
vi.mock("@/features/access/access.onboarding.service", () => ({ getSelectedContext: () => "company-1" }));

describe("solar panel model mock states", () => {
  beforeEach(() => localStorage.clear());

  it("provides approved, rejected and pending models", () => {
    const models = getMockModels();
    expect(new Set(models.map((model) => model.status))).toEqual(new Set(Object.values(SolarPanelModelStatus)));
  });

  it("adds examples to existing stored models without replacing local edits", () => {
    localStorage.setItem("solaria.mock.models", JSON.stringify([{ id: "edited-model", model: "Custom model", status: "APPROVED" }]));
    const models = getMockModels();
    expect(models.find((model) => model.id === "edited-model")?.model).toBe("Custom model");
    expect(new Set(models.map((model) => model.status))).toEqual(new Set(Object.values(SolarPanelModelStatus)));
    expect(getMockModels()).toEqual(models);
  });

  it("does not recreate a deleted example on subsequent reads", () => {
    getMockModels();
    deleteMockModel("mock-model-rejected");
    expect(getMockModels().some((model) => model.id === "mock-model-rejected")).toBe(false);
  });
});
