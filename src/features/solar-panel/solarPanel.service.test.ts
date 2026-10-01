import { describe, expect, it, vi } from "vitest";

import {
  createSolarPanel,
  deleteSolarPanel,
  listApprovedSolarPanelModels,
  listSolarPanelModels,
  updateSolarPanel,
} from "./solarPanel.service";
import { SolarPanelType } from "./solarPanel.enum";
import { httpJson } from "@/lib/shared/http/http.service";

vi.mock("@/lib/shared/http/http.service", () => ({ httpJson: vi.fn() }));

const modelDto = {
  id: "model-1", brand: "SolarTech", model: "ST-450W", type: "MONOCRYSTALLINE" as const,
  powerWp: 450, efficiency: 21.5, width: 1, length: 2.1, weight: 23.5, status: "APPROVED" as const,
};

describe("solarPanel.service models", () => {
  it("lists all models and maps the backend type to the display enum", async () => {
    vi.mocked(httpJson).mockResolvedValue([modelDto]);

    const result = await listSolarPanelModels();

    expect(httpJson).toHaveBeenCalledWith(expect.stringContaining("/api/models"), expect.anything());
    expect(result).toEqual([{
      id: "model-1", brand: "SolarTech", model: "ST-450W", type: SolarPanelType.MONOCRYSTALLINE,
      powerOutput: 450, efficiency: 21.5, dimension: { width: 1, length: 2.1 }, weight: 23.5, status: "APPROVED",
    }]);
  });

  it("lists only approved models", async () => {
    vi.mocked(httpJson).mockResolvedValue([modelDto]);

    await listApprovedSolarPanelModels();

    expect(httpJson).toHaveBeenCalledWith(expect.stringContaining("/api/models/status/APPROVED"), expect.anything());
  });

  it("creates a model translating the display type back to the backend enum", async () => {
    vi.mocked(httpJson).mockResolvedValue(modelDto);

    await createSolarPanel({
      brand: "SolarTech", model: "ST-450W", type: SolarPanelType.MONOCRYSTALLINE,
      powerOutput: 450, efficiency: 21.5, dimension: { width: 1, length: 2.1 }, weight: 23.5,
    });

    expect(httpJson).toHaveBeenCalledWith(expect.stringContaining("/api/models"), expect.objectContaining({
      method: "POST",
      body: { brand: "SolarTech", model: "ST-450W", type: "MONOCRYSTALLINE", powerWp: 450, efficiency: 21.5, width: 1, length: 2.1, weight: 23.5 },
    }));
  });

  it("updates a model", async () => {
    vi.mocked(httpJson).mockResolvedValue(modelDto);

    await updateSolarPanel("model-1", {
      brand: "SolarTech", model: "ST-450W", type: SolarPanelType.THINFILM,
      powerOutput: 450, efficiency: 21.5, dimension: { width: 1, length: 2.1 }, weight: 23.5,
    });

    expect(httpJson).toHaveBeenCalledWith(expect.stringContaining("/api/models/model-1"), expect.objectContaining({
      method: "PUT",
      body: expect.objectContaining({ type: "THIN_FILM" }),
    }));
  });

  it("deletes a model", async () => {
    vi.mocked(httpJson).mockResolvedValue(undefined);

    await deleteSolarPanel("model-1");

    expect(httpJson).toHaveBeenCalledWith(expect.stringContaining("/api/models/model-1"), expect.objectContaining({ method: "DELETE" }));
  });
});
