import type { SolarPanel } from "./solarPanel";
import type { SolarPanelAnnouncement } from "./solarPanelAnnouncement";

import { solarPanelAnnouncementMocks } from "@/config/mocks/registry";
import { resolveWithMocks } from "@/config/mocks/fallback.service";
import { httpJson } from "@/shared/http/http.service";

const API = import.meta.env.VITE_API_PERSISTENCE;
const SERVICE_NAME = "solarPanel";

export function getSolarPanel(id: string): Promise<SolarPanelAnnouncement> {
  return resolveWithMocks(
    () =>
      httpJson<SolarPanelAnnouncement>(`${API}/solar-panels/${id}`, {
        service: SERVICE_NAME,
        operation: "getSolarPanel",
        errorMessage: `Não foi possível obter o painel solar ${id}`,
      }),
    () => solarPanelAnnouncementMocks.find((announcement) => announcement.id === id) ?? solarPanelAnnouncementMocks[0],
  );
}

// `slug`/`companySlug` ainda não existem em `model`/`announcement` no
// schema-api-core.sql (ver NOTE em `solarPanelAnnouncement.d.ts`) — usados
// pela rota amigável do anúncio (/placa-solar/{companySlug}/{slug}).
export function getSolarPanelBySlug(companySlug: string, slug: string): Promise<SolarPanelAnnouncement> {
  return resolveWithMocks(
    () =>
      httpJson<SolarPanelAnnouncement>(`${API}/solar-panels/slug/${companySlug}/${slug}`, {
        service: SERVICE_NAME,
        operation: "getSolarPanelBySlug",
        errorMessage: `Não foi possível obter o painel solar ${companySlug}/${slug}`,
      }),
    () =>
      solarPanelAnnouncementMocks.find((announcement) => announcement.companySlug === companySlug && announcement.slug === slug) ??
      solarPanelAnnouncementMocks[0],
  );
}

export function getSolarPanels(ids: string[]): Promise<SolarPanelAnnouncement[]> {
  return resolveWithMocks(
    () =>
      httpJson<SolarPanelAnnouncement[]>(`${API}/solar-panels?ids=${ids.join(",")}`, {
        service: SERVICE_NAME,
        operation: "getSolarPanels",
        errorMessage: "Não foi possível obter os painéis solares",
      }),
    () => solarPanelAnnouncementMocks,
  );
}

// A seguir: CRUD dos modelos de placa solar (tabela `model` do schema).
// Ainda não existe endpoint real para essas operações — o fallback apenas
// ecoa o payload recebido (`resolveWithMocks`), então nada persiste entre
// recarregamentos até a API de fato existir.

export function listSolarPanelModels(): Promise<SolarPanel[]> {
  return resolveWithMocks(
    () =>
      httpJson<SolarPanel[]>(`${API}/solar-panel-models`, {
        service: SERVICE_NAME,
        operation: "listSolarPanelModels",
        errorMessage: "Não foi possível obter os modelos de placa solar",
      }),
    () => solarPanelAnnouncementMocks.map((announcement) => announcement.panel),
  );
}

export function createSolarPanel(payload: Omit<SolarPanel, "id">): Promise<SolarPanel> {
  return resolveWithMocks(
    () =>
      httpJson<SolarPanel>(`${API}/solar-panel-models`, {
        service: SERVICE_NAME,
        operation: "createSolarPanel",
        method: "POST",
        body: payload,
        errorMessage: "Não foi possível criar o modelo de placa solar",
      }),
    () => ({ ...payload, id: crypto.randomUUID() }) as SolarPanel,
  );
}

export function updateSolarPanel(id: string, payload: Omit<SolarPanel, "id">): Promise<SolarPanel> {
  return resolveWithMocks(
    () =>
      httpJson<SolarPanel>(`${API}/solar-panel-models/${id}`, {
        service: SERVICE_NAME,
        operation: "updateSolarPanel",
        method: "PUT",
        body: payload,
        errorMessage: `Não foi possível atualizar o modelo ${id}`,
      }),
    () => ({ ...payload, id }) as SolarPanel,
  );
}

export function deleteSolarPanel(id: string): Promise<void> {
  return resolveWithMocks(
    () =>
      httpJson<void>(`${API}/solar-panel-models/${id}`, {
        service: SERVICE_NAME,
        operation: "deleteSolarPanel",
        method: "DELETE",
        errorMessage: `Não foi possível remover o modelo ${id}`,
      }),
    () => undefined,
  );
}
