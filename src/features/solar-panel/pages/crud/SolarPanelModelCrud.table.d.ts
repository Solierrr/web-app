import type { SolarPanelType, SolarPanelModelStatus } from "@/features/solar-panel/solarPanel.enum";

export type ModelSortField = "power" | "efficiency" | "width" | "length" | "weight";
export interface ModelSort { field: ModelSortField; direction: "asc" | "desc" }
export interface ModelFilters {
  query?: string;
  type?: SolarPanelType;
  status?: SolarPanelModelStatus;
  ranges: Partial<Record<ModelSortField, { min: string; max: string }>>;
}
