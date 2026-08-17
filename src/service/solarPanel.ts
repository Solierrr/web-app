import type { SolarPanelAnnouncement } from '@/domain/models/announcemnt/solarPanel';
import { solarPanelAnnouncementMocks } from "./mocks/handler"

export function getSolarPanel(id: string): SolarPanelAnnouncement {
    // Sem conexão com banco ainda
    const mocks = solarPanelAnnouncementMocks
    return mocks[Math.floor(Number(id))]
}

export function getSolarPanels(ids: string[]): SolarPanelAnnouncement[] {
    return solarPanelAnnouncementMocks
}