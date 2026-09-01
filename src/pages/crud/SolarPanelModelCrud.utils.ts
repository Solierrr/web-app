import { SolarPanelType, SolarPanelModelStatus } from "@/features/products/solar-panel/solarPanel.enum";
import type { SolarPanel, SolarPanelDimension } from "@/features/products/solar-panel/solarPanel";

export const EMPTY_DIMENSION: SolarPanelDimension = { width: 0, length: 0 };

export const EMPTY_FORM: Omit<SolarPanel, "id"> = {
  brand: "",
  model: "",
  type: SolarPanelType.MONOCRYSTALLINE,
  powerOutput: 0,
  efficiency: 0,
  dimension: EMPTY_DIMENSION,
  weight: 0,
  status: SolarPanelModelStatus.UNDERANALYSIS,
};
