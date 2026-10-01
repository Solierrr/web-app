import { solarPanelAnnouncementMocks } from "@/config/mocks/registry";
import { getSelectedContext } from "@/features/access/onboarding.service";
import type { SolarPanel } from "./solarPanel";

const STORAGE_KEY = "solaria.mock.models";

export function getMockModels(): SolarPanel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    return [];
  }
  return [...new Map(solarPanelAnnouncementMocks.map((item) => [item.panel.id, { ...item.panel, creatorCompanyId: getSelectedContext() }])).values()];
}

export function saveMockModel(model: SolarPanel): SolarPanel {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...getMockModels().filter((item) => item.id !== model.id), model]));
  return model;
}

export function deleteMockModel(id: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getMockModels().filter((item) => item.id !== id)));
}
