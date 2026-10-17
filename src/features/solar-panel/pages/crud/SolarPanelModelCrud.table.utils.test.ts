import { describe, expect, it } from "vitest";
import { selectModels, modelReferences } from "./SolarPanelModelCrud.table.utils";
import { SolarPanelModelStatus, SolarPanelType } from "@/features/solar-panel/solarPanel.enum";
import type { SolarPanel } from "@/features/solar-panel/solarPanel";

const models: SolarPanel[] = [
  {
    id: "a",
    status: SolarPanelModelStatus.APPROVED,
    type: SolarPanelType.MONOCRYSTALLINE,
    powerOutput: 0,
    efficiency: 20,
    dimension: { width: 1, length: 2 },
    weight: 20,
  },
  {
    id: "b",
    status: SolarPanelModelStatus.REJECTED,
    type: SolarPanelType.POLYCRYSTALLINE,
    powerOutput: 450,
    efficiency: 22,
    dimension: { width: 1.2, length: 2.5 },
    weight: 25,
  },
  {
    id: "c",
    status: SolarPanelModelStatus.APPROVED,
    type: SolarPanelType.MONOCRYSTALLINE,
    powerOutput: 600,
    efficiency: 23,
    dimension: { width: 1.5, length: 3 },
    weight: 30,
  },
  { id: "d", status: SolarPanelModelStatus.APPROVED },
];

describe("model table selection", () => {
  it("keeps comparisons within panel type and independent of filters, order and pagination", () => {
    const references = modelReferences(models);
    expect(references.get(SolarPanelType.MONOCRYSTALLINE)?.power).toEqual({ min: 0, max: 600, mean: 300, count: 2 });
    expect(references.get(SolarPanelType.POLYCRYSTALLINE)?.power?.count).toBe(1);
    selectModels(models, { ranges: { power: { min: "500", max: "" } } }, { field: "power", direction: "desc" }).slice(0, 5);
    expect(modelReferences(models)).toEqual(references);
    expect(references.size).toBe(2);
  });
  it("combines categorical and inclusive numeric filters, including zero", () => {
    const filtered = selectModels(
      models,
      {
        type: SolarPanelType.MONOCRYSTALLINE,
        status: SolarPanelModelStatus.APPROVED,
        ranges: { power: { min: "0", max: "600" }, width: { min: "1", max: "1.5" }, weight: { min: "", max: "25" } },
      },
      null,
    );
    expect(filtered.map((item) => item.id)).toEqual(["a"]);
  });
  it.each(["power", "efficiency", "width", "length", "weight"] as const)("orders %s across the catalog, keeping missing values last", (field) => {
    expect(selectModels(models, { ranges: {} }, { field, direction: "asc" }).map((item) => item.id)).toEqual(["a", "b", "c", "d"]);
    expect(selectModels(models, { ranges: {} }, { field, direction: "desc" }).map((item) => item.id)).toEqual(["c", "b", "a", "d"]);
    expect(models.map((item) => item.id)).toEqual(["a", "b", "c", "d"]);
  });
  it("preserves original order when sorting is cleared and handles empty ranges", () => {
    expect(selectModels(models, { ranges: { power: { min: "", max: "" } } }, null)).toEqual(models);
    expect(selectModels(models, { ranges: { power: { min: "500", max: "100" } } }, null)).toEqual([]);
  });
});
