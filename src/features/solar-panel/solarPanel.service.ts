import type { SolarPanel } from "./solarPanel";
import type { SolarPanelAnnouncement } from "./solarPanel.announcement";

import { solarPanelAnnouncementMocks } from "@/config/mocks/registry";
import { resolveWithMocks } from "@/config/mocks/fallback.service";
import { httpJson } from "@/lib/shared/http/http.service";
import { SolarPanelModelStatus, SolarPanelType } from "./solarPanel.enum";
import { DEFAULT as DEFAULT_LANGUAGE, type SupportedLanguage } from "@/config/inter/browser/languages";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import { getMockModels, saveMockModel, deleteMockModel } from "./solarPanel.d.mocks";
import { getSelectedContext } from "@/features/access/access.onboarding.service";

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
  const type =
    offer.type === "THIN_FILM"
      ? SolarPanelType.THINFILM
      : offer.type === "POLYCRYSTALLINE"
        ? SolarPanelType.POLYCRYSTALLINE
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
    () =>
      httpJson<CatalogOffer[]>(`${API}/api/catalog/offers?locale=${encodeURIComponent(lang)}`, {
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
      httpJson<CatalogOffer>(
        `${API}/api/catalog/offers/${encodeURIComponent(companySlug)}/${encodeURIComponent(slug)}?locale=${encodeURIComponent(lang)}`,
        {
          service: SERVICE_NAME,
          operation: "getSolarPanelBySlug",
          authenticated: false,
          errorMessage: `Não foi possível obter o painel solar ${companySlug}/${slug}`,
        },
      ).then(toAnnouncement),
    () => {
      const mock = solarPanelAnnouncementMocks.find((announcement) => announcement.companySlug === companySlug && announcement.slug === slug);
      if (!mock) throw new Error(`Painel solar não encontrado: ${companySlug}/${slug}`);
      return mock;
    },
  );
}

interface ModelDTO {
  id: string;
  creatorCompanyId?: string | null;
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
    creatorCompanyId: dto.creatorCompanyId,
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

export async function listSolarPanelModels(): Promise<SolarPanel[]> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return getMockModels();
  }
  return httpJson<ModelDTO[]>(`${API}/api/models`, {
    service: SERVICE_NAME,
    operation: "listSolarPanelModels",
    errorMessage: "Não foi possível obter os modelos de placa solar",
  }).then((models) => models.map(toSolarPanel));
}

export async function listApprovedSolarPanelModels(): Promise<SolarPanel[]> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return getMockModels().filter((item) => item.status === SolarPanelModelStatus.APPROVED);
  }
  return httpJson<ModelDTO[]>(`${API}/api/models/status/APPROVED`, {
    service: SERVICE_NAME,
    operation: "listApprovedSolarPanelModels",
    errorMessage: "Não foi possível obter os modelos aprovados",
  }).then((models) => models.map(toSolarPanel));
}

export async function listSolarPanelModelsByStatus(status: SolarPanelModelStatus): Promise<SolarPanel[]> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return getMockModels().filter((item) => item.status === status);
  }
  return httpJson<ModelDTO[]>(`${API}/api/models/status/${encodeURIComponent(status)}`, {
    service: SERVICE_NAME,
    operation: "listSolarPanelModelsByStatus",
    errorMessage: "Não foi possível obter os modelos de placa solar",
  }).then((models) => models.map(toSolarPanel));
}

export async function approveSolarPanel(id: string): Promise<SolarPanel> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return saveMockModel({ ...(getMockModels().find((item) => item.id === id) ?? { id }), status: SolarPanelModelStatus.APPROVED });
  }
  return httpJson<ModelDTO>(`${API}/api/models/${encodeURIComponent(id)}/approval`, {
    service: SERVICE_NAME,
    operation: "approveSolarPanel",
    method: "POST",
    errorMessage: `Não foi possível aprovar o modelo ${id}`,
  }).then(toSolarPanel);
}

export async function rejectSolarPanel(id: string): Promise<SolarPanel> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return saveMockModel({ ...(getMockModels().find((item) => item.id === id) ?? { id }), status: SolarPanelModelStatus.REJECTED });
  }
  return httpJson<ModelDTO>(`${API}/api/models/${encodeURIComponent(id)}/rejection`, {
    service: SERVICE_NAME,
    operation: "rejectSolarPanel",
    method: "POST",
    errorMessage: `Não foi possível rejeitar o modelo ${id}`,
  }).then(toSolarPanel);
}

export async function createSolarPanel(payload: Omit<SolarPanel, "id" | "status">): Promise<SolarPanel> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return saveMockModel({
      ...payload,
      id: crypto.randomUUID(),
      creatorCompanyId: getSelectedContext(),
      status: SolarPanelModelStatus.UNDERANALYSIS,
    });
  }
  return httpJson<ModelDTO>(`${API}/api/models`, {
    service: SERVICE_NAME,
    operation: "createSolarPanel",
    method: "POST",
    body: toModelPayload(payload),
    errorMessage: "Não foi possível criar o modelo de placa solar",
  }).then(toSolarPanel);
}

export async function updateSolarPanel(id: string, payload: Omit<SolarPanel, "id" | "status">): Promise<SolarPanel> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return saveMockModel({ ...getMockModels().find((item) => item.id === id), ...payload, id, status: SolarPanelModelStatus.UNDERANALYSIS });
  }
  return httpJson<ModelDTO>(`${API}/api/models/${encodeURIComponent(id)}`, {
    service: SERVICE_NAME,
    operation: "updateSolarPanel",
    method: "PUT",
    body: toModelPayload(payload),
    errorMessage: `Não foi possível atualizar o modelo ${id}`,
  }).then(toSolarPanel);
}

export async function deleteSolarPanel(id: string): Promise<void> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    deleteMockModel(id);
    return;
  }
  return httpJson<void>(`${API}/api/models/${encodeURIComponent(id)}`, {
    service: SERVICE_NAME,
    operation: "deleteSolarPanel",
    method: "DELETE",
    errorMessage: `Não foi possível remover o modelo ${id}`,
  });
}
