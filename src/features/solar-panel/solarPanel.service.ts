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

interface ModelDTO {
  id: string;
  brand: string;
  model: string;
  type: "MONOCRYSTALLINE" | "POLYCRYSTALLINE" | "THIN_FILM";
  powerWp: number;
  efficiency: number;
  width: number;
  length: number;
  weight: number;
  status: "APPROVED" | "REJECTED" | "UNDER_ANALYSIS";
}

function toBackendType(type?: SolarPanelType): ModelDTO["type"] {
  if (type === SolarPanelType.THINFILM) return "THIN_FILM";
  if (type === SolarPanelType.POLYCRYSTALLINE) return "POLYCRYSTALLINE";
  return "MONOCRYSTALLINE";
}

function fromBackendType(type: ModelDTO["type"]): SolarPanelType {
  if (type === "THIN_FILM") return SolarPanelType.THINFILM;
  if (type === "POLYCRYSTALLINE") return SolarPanelType.POLYCRYSTALLINE;
  return SolarPanelType.MONOCRYSTALLINE;
}

function toSolarPanel(dto: ModelDTO): SolarPanel {
  return {
    id: dto.id,
    brand: dto.brand,
    model: dto.model,
    type: fromBackendType(dto.type),
    powerOutput: dto.powerWp,
    efficiency: dto.efficiency,
    dimension: { width: dto.width, length: dto.length },
    weight: dto.weight,
    status: dto.status as SolarPanelModelStatus,
  };
}

function toModelPayload(payload: Omit<SolarPanel, "id" | "status">) {
  return {
    brand: payload.brand,
    model: payload.model,
    type: toBackendType(payload.type),
    powerWp: payload.powerOutput,
    efficiency: payload.efficiency,
    width: payload.dimension?.width,
    length: payload.dimension?.length,
    weight: payload.weight,
  };
}

// `Model` é um catálogo compartilhado (sem dono/empresa) — qualquer fornecedor
// pode cadastrar ou editar. A vinculação com uma empresa acontece via `Offer`.
export function listSolarPanelModels(): Promise<SolarPanel[]> {
  return httpJson<ModelDTO[]>(`${API}/api/models`, {
    service: SERVICE_NAME,
    operation: "listSolarPanelModels",
    errorMessage: "Não foi possível obter os modelos de placa solar",
  }).then((models) => models.map(toSolarPanel));
}

export function listApprovedSolarPanelModels(): Promise<SolarPanel[]> {
  return httpJson<ModelDTO[]>(`${API}/api/models/status/APPROVED`, {
    service: SERVICE_NAME,
    operation: "listApprovedSolarPanelModels",
    errorMessage: "Não foi possível obter os modelos aprovados",
  }).then((models) => models.map(toSolarPanel));
}

export function listSolarPanelModelsByStatus(status: SolarPanelModelStatus): Promise<SolarPanel[]> {
  return httpJson<ModelDTO[]>(`${API}/api/models/status/${encodeURIComponent(status)}`, {
    service: SERVICE_NAME,
    operation: "listSolarPanelModelsByStatus",
    errorMessage: "Não foi possível obter os modelos de placa solar",
  }).then((models) => models.map(toSolarPanel));
}

// Admin Solaria: aprovação/rejeição de modelos fica restrita ao platform admin
// no backend (ver RbacAuthorizationService.PLATFORM_ADMIN_ONLY_ENDPOINTS) — Model
// é um catálogo compartilhado, não pertence a nenhum fornecedor específico.
export function approveSolarPanel(id: string): Promise<SolarPanel> {
  return httpJson<ModelDTO>(`${API}/api/models/${encodeURIComponent(id)}/approval`, {
    service: SERVICE_NAME,
    operation: "approveSolarPanel",
    method: "POST",
    errorMessage: `Não foi possível aprovar o modelo ${id}`,
  }).then(toSolarPanel);
}

export function rejectSolarPanel(id: string): Promise<SolarPanel> {
  return httpJson<ModelDTO>(`${API}/api/models/${encodeURIComponent(id)}/rejection`, {
    service: SERVICE_NAME,
    operation: "rejectSolarPanel",
    method: "POST",
    errorMessage: `Não foi possível rejeitar o modelo ${id}`,
  }).then(toSolarPanel);
}

export function createSolarPanel(payload: Omit<SolarPanel, "id" | "status">): Promise<SolarPanel> {
  return httpJson<ModelDTO>(`${API}/api/models`, {
    service: SERVICE_NAME,
    operation: "createSolarPanel",
    method: "POST",
    body: toModelPayload(payload),
    errorMessage: "Não foi possível criar o modelo de placa solar",
  }).then(toSolarPanel);
}

export function updateSolarPanel(id: string, payload: Omit<SolarPanel, "id" | "status">): Promise<SolarPanel> {
  return httpJson<ModelDTO>(`${API}/api/models/${encodeURIComponent(id)}`, {
    service: SERVICE_NAME,
    operation: "updateSolarPanel",
    method: "PUT",
    body: toModelPayload(payload),
    errorMessage: `Não foi possível atualizar o modelo ${id}`,
  }).then(toSolarPanel);
}

export function deleteSolarPanel(id: string): Promise<void> {
  return httpJson<void>(`${API}/api/models/${encodeURIComponent(id)}`, {
    service: SERVICE_NAME,
    operation: "deleteSolarPanel",
    method: "DELETE",
    errorMessage: `Não foi possível remover o modelo ${id}`,
  });
}
