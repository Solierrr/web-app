import { SolarPanelType } from "@/features/solar-panel/solarPanel.enum";
import type { SolarPanel } from "@/features/solar-panel/solarPanel";
import type { SolarPanelModelForm } from "./SolarPanelModelCrud.form";

export const EMPTY_DIMENSION = { width: "", length: "" };

export const EMPTY_FORM: SolarPanelModelForm = {
  brand: "",
  brandId: "",
  model: "",
  type: SolarPanelType.MONOCRYSTALLINE,
  powerOutput: "",
  efficiency: "",
  dimension: EMPTY_DIMENSION,
  weight: "",
};

export function toModelForm(item: SolarPanel): SolarPanelModelForm {
  return {
    brand: item.brand ?? "",
    brandId: item.brandId ?? "",
    model: item.model ?? "",
    type: item.type,
    powerOutput: item.powerOutput == null ? "" : String(item.powerOutput),
    efficiency: item.efficiency == null ? "" : String(item.efficiency),
    weight: item.weight == null ? "" : String(item.weight),
    dimension: {
      width: item.dimension?.width == null ? "" : String(item.dimension.width),
      length: item.dimension?.length == null ? "" : String(item.dimension.length),
    },
  };
}

export function toModelValue(form: SolarPanelModelForm): Omit<SolarPanel, "id" | "status"> {
  return {
    ...form,
    powerOutput: Number(form.powerOutput),
    efficiency: Number(form.efficiency),
    weight: Number(form.weight),
    dimension: { width: Number(form.dimension.width), length: Number(form.dimension.length) },
  };
}
