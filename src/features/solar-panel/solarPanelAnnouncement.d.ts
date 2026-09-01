import type { SolarPanel } from "@/features/solar-panel/solarPanel";
import type { Image } from "@/shared/types/image/image";

export interface SolarPannelPhotos {
  heroImage: Image;
  otherImages: Image[];
}

export interface SolarPanelAnnouncement {
  id: string;
  supplierId: string;
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

  // NOTE: `model`/`announcement` (schema-api-core.sql) não têm coluna de
  // slug. `slug` é gerado a partir de `title`; `companySlug` é uma
  // denormalização do slug da empresa dona de `supplierId` (`company.slug`),
  // só para montar a URL amigável do produto (/placa-solar/{companySlug}/{slug})
  // sem precisar de outra consulta. Ambos ficam mock até existir suporte na API.
  slug: string;
  companySlug: string;
}

export type SolarPanelFeedSummary = Pick<
  SolarPanelAnnouncement,
  "id" | "slug" | "companySlug" | "title" | "unitPrice" | "discountPercentage" | "photos"
>;
