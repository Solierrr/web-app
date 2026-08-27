import PanelPlaceholder from "@/domain/models/products/solarPanel.placeholder";
import ImagePlaceholder from "@/domain/models/shared/image.placeholder";
import type { SolarPanelAnnouncement } from "./solarPanelAnnouncement";

export const SolarPannelPhotosPlaceholder = {
    heroImage:   ImagePlaceholder,
    otherImages: Array(5).fill(ImagePlaceholder),
};

const SolarPanelPlaceholder: SolarPanelAnnouncement = {
    id:                 "12345",
    supplierId:         "54321",
    panel:              PanelPlaceholder,
    title:              "......",
    description:        "......",
    details:            Array(5).fill("......"),
    photos:             SolarPannelPhotosPlaceholder,
    unitPrice:          0,
    discountPercentage: 0,
    availableUnits:     0,
    serviceRegions:     ["......"],
    expirationDate:     "2099-12-31",
};

export default SolarPanelPlaceholder;