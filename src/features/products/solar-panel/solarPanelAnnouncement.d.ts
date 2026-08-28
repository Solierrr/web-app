import type { SolarPanel } from "@/features/products/solar-panel/solarPanel";
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
}

export type SolarPanelFeedSummary = Pick<
  SolarPanelAnnouncement,
  "id" | "title" | "unitPrice" | "discountPercentage" | "photos"
>;
