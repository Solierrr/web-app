import type { SolarPanel } from "@/features/solar-panel/solarPanel";
import type { Company } from "@/features/companies/company";
import type { Image } from "@lib/shared/types/image/image";

export interface SolarPannelPhotos {
  heroImage: Image;
  otherImages: Image[];
}

export interface SolarPanelAnnouncement {
  id: string;
  supplierId: string;
  company: Pick<Company, "id" | "tradeName" | "slug" | "logoUrl">;
  panel: SolarPanel;
  title: string;
  description: string;
  details?: string[];
  photos: SolarPannelPhotos;
  unitPrice: number;
  discountPercentage?: number;
  availableUnits: number;
  serviceRegions: string[];
  expirationDate?: string;

  // NOTE: `model`/`offer` (api-core) não têm coluna de slug. `slug` é gerado
  // a partir de `title`; `companySlug` é uma denormalização de `company.slug`,
  // só para montar a URL amigável do produto (/placa-solar/{companySlug}/{slug})
  // sem precisar de outra consulta. Ambos ficam mock até existir rota por slug
  // na API (hoje `api-core` só busca `Offer`/`Company` por id).
  slug: string;
  companySlug: string;

  // NOTE: sem coluna equivalente em `api-core` ainda — derivados no mock
  // (`solarPanelAnnouncementMock`) só para sustentar as variações do feed
  // (mais vendidos / novidades) até existir a métrica/data real na API.
  soldUnits?: number;
  createdAt?: string;
}

export type SolarPanelFeedSummary = Pick<
  SolarPanelAnnouncement,
  "id" | "slug" | "companySlug" | "title" | "unitPrice" | "discountPercentage" | "photos" | "soldUnits" | "createdAt"
>;
