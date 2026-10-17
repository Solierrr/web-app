import type { SolarPanelModelStatus as ModelStatus, SolarPanelType } from "./solarPanel.enum";

export interface SolarPanelDimension {
  width: number;
  length: number;
}

export interface SolarPanel {
  id: string;
  productType?: "PANEL" | "INFRASTRUCTURE";
  infrastructureType?: "RAIL" | "CLAMP" | "BRACKET" | "HOOK" | "KIT" | "OTHER";
  material?: string;
  creatorCompanyId?: string | null;
  brand?: string;
  brandId?: string;
  model?: string;
  type?: SolarPanelType;
  powerOutput?: number;
  efficiency?: number;
  dimension?: SolarPanelDimension;
  weight?: number;
  status: ModelStatus;
}
