import type { SolarPanel } from "./solarPanel";
import type { SolarPanelAnnouncement } from "./solarPanelAnnouncement";

import { solarPanelAnnouncementMocks } from "@/config/mocks/registry";
import { resolveWithMocks } from "@/config/mocks/fallback.service";

const API = import.meta.env.VITE_API_PERSISTENCE;

async function fetchJson<T>(path: string, errorMessage: string): Promise<T> {
  const response = await fetch(`${API}${path}`);

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

async function sendJson<T>(
  path: string,
  method: "POST" | "PUT" | "DELETE",
  body: unknown,
  errorMessage: string,
): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

export function getSolarPanel(id: string): Promise<SolarPanelAnnouncement> {
  return resolveWithMocks(
    () =>
      fetchJson<SolarPanelAnnouncement>(
        `/solar-panels/${id}`,
        `Não foi possível obter o painel solar ${id}`,
      ),
    () => solarPanelAnnouncementMocks.find((announcement) => announcement.id === id) ?? solarPanelAnnouncementMocks[0],
  );
}

// `slug`/`companySlug` ainda não existem em `model`/`announcement` no
// schema-api-core.sql (ver NOTE em `solarPanelAnnouncement.d.ts`) — usados
// pela rota amigável do anúncio (/placa-solar/{companySlug}/{slug}).
export function getSolarPanelBySlug(
  companySlug: string,
  slug: string,
): Promise<SolarPanelAnnouncement> {
  return resolveWithMocks(
    () =>
      fetchJson<SolarPanelAnnouncement>(
        `/solar-panels/slug/${companySlug}/${slug}`,
        `Não foi possível obter o painel solar ${companySlug}/${slug}`,
      ),
    () =>
      solarPanelAnnouncementMocks.find(
        (announcement) => announcement.companySlug === companySlug && announcement.slug === slug,
      ) ?? solarPanelAnnouncementMocks[0],
  );
}

export function getSolarPanels(
  ids: string[],
): Promise<SolarPanelAnnouncement[]> {
  return resolveWithMocks(
    () =>
      fetchJson<SolarPanelAnnouncement[]>(
        `/solar-panels?ids=${ids.join(",")}`,
        "Não foi possível obter os painéis solares",
      ),
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
      fetchJson<SolarPanel[]>(
        "/solar-panel-models",
        "Não foi possível obter os modelos de placa solar",
      ),
    () => solarPanelAnnouncementMocks.map((announcement) => announcement.panel),
  );
}

export function createSolarPanel(
  payload: Omit<SolarPanel, "id">,
): Promise<SolarPanel> {
  return resolveWithMocks(
    () =>
      sendJson<SolarPanel>(
        "/solar-panel-models",
        "POST",
        payload,
        "Não foi possível criar o modelo de placa solar",
      ),
    () => ({ ...payload, id: crypto.randomUUID() }) as SolarPanel,
  );
}

export function updateSolarPanel(
  id: string,
  payload: Omit<SolarPanel, "id">,
): Promise<SolarPanel> {
  return resolveWithMocks(
    () =>
      sendJson<SolarPanel>(
        `/solar-panel-models/${id}`,
        "PUT",
        payload,
        `Não foi possível atualizar o modelo ${id}`,
      ),
    () => ({ ...payload, id }) as SolarPanel,
  );
}

export function deleteSolarPanel(id: string): Promise<void> {
  return resolveWithMocks(
    () =>
      sendJson<void>(
        `/solar-panel-models/${id}`,
        "DELETE",
        undefined,
        `Não foi possível remover o modelo ${id}`,
      ),
    () => undefined,
  );
}
