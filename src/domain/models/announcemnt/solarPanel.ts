import type { SolarPanel } from '@/domain/models/products/solarPanel';

export interface SolarPanelAnnouncement {
    id: string;
    supplierId: string;
    panel: SolarPanel;

    title: string;
    description: string;
    details?: string[];
    photos: string[];

    unitPrice: number;
    discountPercentage?: number;
    availableUnits: number;
    serviceRegions: string[];
    expirationDate?: string;
}

export type SolarPanelFeedSummary = Pick< SolarPanelAnnouncement,
    'id' | 'title' | 'unitPrice' | 'discountPercentage' | 'photos' >;
