import type { SolarPanel } from "../../solarPanel";

export type SolarPanelModelForm = Omit<SolarPanel, "id" | "status" | "powerOutput" | "efficiency" | "weight" | "dimension"> & {
  powerOutput: string;
  efficiency: string;
  weight: string;
  dimension: { width: string; length: string };
};
