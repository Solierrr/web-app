import type { SolarPanel } from "./solarPanel";
import type { SolarPanelModelStatus as ModelStatus } from "./solarPanel.enum";
import SolarPanelType from "../solarPanelType.enum";

export const SolarPanelDimensionPlaceholder = {
  width: 0,
  length: 0,
};

const SolarPanelPlaceholder: SolarPanel = {
  id: "12345",
  brand: "......",
  model: "......",
  type: "......" as SolarPanelType,
  powerOutput: 0,
  efficiency: 0,
  dimension: SolarPanelDimensionPlaceholder,
  weight: 0,
  status: "......" as ModelStatus,
};

export default SolarPanelPlaceholder;
