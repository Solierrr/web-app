import type {
  SolarPanelModelStatus as ModelStatus,
  SolarPanelType,
} from "./solarPanel.enum";

export interface SolarPanelDimension {
  width: number;
  length: number;
}

export interface SolarPanel {
  id: string;
  brand?: string;
  model?: string;
  type?: SolarPanelType;
  powerOutput?: number;
  efficiency?: number;
  dimension?: SolarPanelDimension;
  weight?: number;
  status: ModelStatus;
}
