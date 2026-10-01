import type { Message } from "@/features/messages/messages";
import type { SolarPanel } from "@/features/solar-panel/solarPanel";
import type { SolarPanelAnnouncement } from "@/features/solar-panel/solarPanelAnnouncement";

import { messagesMocks, solarPanelAnnouncementMocks } from "./registry";

function cloneMockValue<T>(value: T): T {
  return structuredClone(value);
}

let solarPanelAnnouncements: SolarPanelAnnouncement[] = solarPanelAnnouncementMocks.map((announcement) => ({
  ...cloneMockValue(announcement),
}));
let solarPanelModels: SolarPanel[] = solarPanelAnnouncementMocks.map((announcement) => cloneMockValue(announcement.panel));

const messagesByChat = new Map<string, Message[]>();

export function getMockSolarPanel(id: string): SolarPanelAnnouncement {
  return cloneMockValue(solarPanelAnnouncements.find((announcement) => announcement.id === id) ?? solarPanelAnnouncements[0]);
}

export function getMockSolarPanelBySlug(companySlug: string, slug: string): SolarPanelAnnouncement {
  return cloneMockValue(
    solarPanelAnnouncements.find((announcement) => announcement.companySlug === companySlug && announcement.slug === slug) ??
      solarPanelAnnouncements[0],
  );
}

export function getMockSolarPanels(): SolarPanelAnnouncement[] {
  return cloneMockValue(solarPanelAnnouncements);
}

export function getMockSolarPanelModels(): SolarPanel[] {
  return cloneMockValue(solarPanelModels);
}

export function createMockSolarPanel(payload: Omit<SolarPanel, "id">): SolarPanel {
  const created: SolarPanel = { ...cloneMockValue(payload), id: crypto.randomUUID() };
  solarPanelModels = [...solarPanelModels, created];
  return cloneMockValue(created);
}

export function updateMockSolarPanel(id: string, payload: Omit<SolarPanel, "id">): SolarPanel {
  const updated: SolarPanel = { ...cloneMockValue(payload), id };
  const existingIndex = solarPanelModels.findIndex((model) => model.id === id);

  if (existingIndex === -1) {
    solarPanelModels = [...solarPanelModels, updated];
  } else {
    solarPanelModels = solarPanelModels.map((model) => (model.id === id ? updated : model));
  }

  solarPanelAnnouncements = solarPanelAnnouncements.map((announcement) =>
    announcement.panel.id === id ? { ...announcement, panel: cloneMockValue(updated) } : announcement,
  );

  return cloneMockValue(updated);
}

export function deleteMockSolarPanel(id: string): void {
  solarPanelModels = solarPanelModels.filter((model) => model.id !== id);
  solarPanelAnnouncements = solarPanelAnnouncements.filter((announcement) => announcement.panel.id !== id);
}

export function getMockMessages(chatId: string): Message[] {
  const messages = messagesByChat.get(chatId);
  if (messages) return cloneMockValue(messages);

  const initialMessages = cloneMockValue(messagesMocks);
  messagesByChat.set(chatId, initialMessages);
  return cloneMockValue(initialMessages);
}

export function addMockMessage(chatId: string, message: Message): void {
  messagesByChat.set(chatId, [...getMockMessages(chatId), cloneMockValue(message)]);
}
