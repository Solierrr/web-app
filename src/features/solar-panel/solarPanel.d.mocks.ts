import { solarPanelAnnouncementMocks } from "@/config/mocks/registry";
import { getSelectedContext } from "@/features/access/access.onboarding.service";
import { SolarPanelModelStatus } from "./solarPanel.enum";
import type { SolarPanel } from "./solarPanel";

const STORAGE_KEY = "solaria.mock.models";

const VERSION_KEY = `${STORAGE_KEY}.version`;

export function getMockModels(): SolarPanel[] {
  const initial = [
    ...new Map(solarPanelAnnouncementMocks.map((item) => [item.panel.id, { ...item.panel, creatorCompanyId: getSelectedContext() }])).values(),
  ];
  let models: SolarPanel[] = initial;
  let hasSaved = false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (Array.isArray(saved)) {
        models = saved;
        hasSaved = true;
      }
    }
  } catch {
    models = initial;
  }
  if (!hasSaved || localStorage.getItem(VERSION_KEY) !== "2") {
    const base = initial[0];
    if (base) {
      const examples: SolarPanel[] = [
        { ...base, id: "mock-model-under-analysis", model: `${base.model ?? "Solar"} Pro`, status: SolarPanelModelStatus.UNDERANALYSIS },
        { ...base, id: "mock-model-rejected", model: `${base.model ?? "Solar"} Plus`, status: SolarPanelModelStatus.REJECTED },
      ];
      models = [...models, ...examples.filter((example) => !models.some((model) => model.id === example.id))];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(models));
    localStorage.setItem(VERSION_KEY, "2");
  }
  return models;
}

export function saveMockModel(model: SolarPanel): SolarPanel {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...getMockModels().filter((item) => item.id !== model.id), model]));
  return model;
}

export function deleteMockModel(id: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getMockModels().filter((item) => item.id !== id)));
}
