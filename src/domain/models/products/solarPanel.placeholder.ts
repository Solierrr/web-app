import type { SolarPanel } from "@/domain/models/products/solarPanel";
import type ModelStatus from "@/domain/enum/modelStatus";
import SolarPanelType   from "@/domain/enum/solarPanelType";

export const SolarPanelDimensionPlaceholder = {
    width: 0,
    length: 0,
};

const SolarPanelPlaceholder: SolarPanel = {
    id:          "12345",
    brand:       "......",
    model:       "......",
    type:        "......" as SolarPanelType,
    powerOutput: 0,
    efficiency:  0,
    dimension:   SolarPanelDimensionPlaceholder,
    weight:      0,
    status:      "......" as ModelStatus,
};

export default SolarPanelPlaceholder;