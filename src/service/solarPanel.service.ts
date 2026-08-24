import type { SolarPanelAnnouncement } from '@/domain/models/announcemnt/solarPanel';

import { solarPanelAnnouncementMocks } from "./mocks/handler.service"
import { resolveWithMocks } from "./persistence.service"

const API = import.meta.env.VITE_API_PERSISTENCE

async function fetchJson<T>(path: string, errorMessage: string): Promise<T> {
    const response = await fetch(`${API}${path}`)

    if (!response.ok) { throw new Error(errorMessage) }

    return response.json()
}

export function getSolarPanel(id: string): Promise<SolarPanelAnnouncement> {
    return resolveWithMocks(
        () => fetchJson<SolarPanelAnnouncement>(`/solar-panels/${id}`, `Não foi possível obter o painel solar ${id}`),
        () => solarPanelAnnouncementMocks[Math.floor(Number(id))],
    )
}

export function getSolarPanels(ids: string[]): Promise<SolarPanelAnnouncement[]> {
    return resolveWithMocks(
        () => fetchJson<SolarPanelAnnouncement[]>(`/solar-panels?ids=${ids.join(',')}`, "Não foi possível obter os painéis solares"),
        () => solarPanelAnnouncementMocks,
    )
}
