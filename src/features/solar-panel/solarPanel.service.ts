import type { SolarPanel } from "./solarPanel";
import type { SolarPanelAnnouncement } from "./solarPanelAnnouncement";

import { solarPanelAnnouncementMocks } from "@/config/mocks/registry";
import { resolveWithMocks } from "@/config/mocks/fallback.service";
import { httpJson } from "@/shared/http/http.service";
import { SolarPanelModelStatus, SolarPanelType } from "./solarPanel.enum";
import { DEFAULT as DEFAULT_LANGUAGE, type SupportedLanguage } from "@/config/inter/browser/languages";

const API = import.meta.env.VITE_API_CORE;
const SERVICE_NAME = "solarPanel";

interface CatalogOffer {
  id: string;
  slug: string;
  companyId: string;
  companySlug: string;
  companyTradeName: string;
  title: string;
  description: string;
  details: string;
  modelId: string;
  brand: string;
  model: string;
  type: "MONOCRYSTALLINE" | "POLYCRYSTALLINE" | "THIN_FILM";
  powerWp: number;
  efficiency: number;
  width: number;
  length: number;
  weight: number;
  unitPrice: number;
  discountPercentage: number | null;
  availability: number;
  serviceRegions: string[] | null;
  photoUrls: string[];
}

function toAnnouncement(offer: CatalogOffer): SolarPanelAnnouncement {
  const image = offer.photoUrls[0] ?? "/images/solar-panel-placeholder.svg";
  const type = offer.type === "THIN_FILM" ? SolarPanelType.THINFILM
    : offer.type === "POLYCRYSTALLINE" ? SolarPanelType.POLYCRYSTALLINE
    : SolarPanelType.MONOCRYSTALLINE;
  return {
    id: offer.id,
    supplierId: offer.companyId,
    company: { id: offer.companyId, slug: offer.companySlug, tradeName: offer.companyTradeName },
    companySlug: offer.companySlug,
    slug: offer.slug,
    title: offer.title,
    description: offer.description,
    details: offer.details ? [offer.details] : undefined,
    panel: {
      id: offer.modelId,
      brand: offer.brand,
      model: offer.model,
      type,
      powerOutput: offer.powerWp,
      efficiency: offer.efficiency,
      dimension: { width: offer.width, length: offer.length },
      weight: offer.weight,
      status: SolarPanelModelStatus.APPROVED,
    },
    photos: {
      heroImage: { url: image, description: offer.title },
      otherImages: offer.photoUrls.slice(1).map((url) => ({ url, description: offer.title })),
    },
    unitPrice: Number(offer.unitPrice),
    discountPercentage: offer.discountPercentage == null ? undefined : Number(offer.discountPercentage),
    availableUnits: offer.availability,
    serviceRegions: offer.serviceRegions ?? [],
  };
}

export function getCatalogSolarPanels(lang: SupportedLanguage): Promise<SolarPanelAnnouncement[]> {
  return resolveWithMocks(
    () => httpJson<CatalogOffer[]>(`${API}/api/catalog/offers?locale=${encodeURIComponent(lang)}`, {
      service: SERVICE_NAME,
      operation: "getCatalogSolarPanels",
      authenticated: false,
      errorMessage: "Não foi possível carregar as placas solares",
    }).then((offers) => offers.map(toAnnouncement)),
    () => solarPanelAnnouncementMocks,
  );
}

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

export function getSolarPanelBySlug(companySlug: string, slug: string, lang: SupportedLanguage = DEFAULT_LANGUAGE): Promise<SolarPanelAnnouncement> {
  return resolveWithMocks(
    () =>
      httpJson<CatalogOffer>(`${API}/api/catalog/offers/${encodeURIComponent(companySlug)}/${encodeURIComponent(slug)}?locale=${encodeURIComponent(lang)}`, {
        service: SERVICE_NAME,
        operation: "getSolarPanelBySlug",
        authenticated: false,
        errorMessage: `Não foi possível obter o painel solar ${companySlug}/${slug}`,
      }).then(toAnnouncement),
    () => {
      const mock = solarPanelAnnouncementMocks.find((announcement) => announcement.companySlug === companySlug && announcement.slug === slug);
      if (!mock) throw new Error(`Painel solar não encontrado: ${companySlug}/${slug}`);
      return mock;
    },
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
