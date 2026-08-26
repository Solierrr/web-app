import type SolarPanelType from '@/domain/enum/solarPanelType';
import type ModelStatus from '@/domain/enum/modelStatus';

export interface SolarPanelDimension {
    width: number;
    length: number;
}

export default interface SolarPanel {
    id: string;

    // Vendor-supplied characteristics: often incomplete, so all of them are optional.
    brand?: string;
    model?: string;
    type?: SolarPanelType;

    powerOutput?: number;
    efficiency?: number;
    dimension?: SolarPanelDimension;
    weight?: number;

    status: ModelStatus;
}
