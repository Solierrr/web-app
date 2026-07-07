export interface SolarPanel {
    id: string;
    brand: string;
    model: string;
    efficiency: number;
    powerOutput: number;
    dimensions: {
        length: number;
        width: number;
        thickness: number;
    };
    weight: number;
    warranty: number;
}