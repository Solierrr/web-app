import type SolarPanelType from '@/domain/enum/solarPanelType';
import type ModelStatus from '@/domain/enum/modelStatus';

export interface SolarPanel {
    id: string;

    brand: string;
    model: string;
    type: SolarPanelType;

    powerOutput: number;
    efficiency: number;
    dimension: number;
    weight: number;

    status: ModelStatus;
}
