import type { SolarPanelAnnouncement } from "@/features/solar-panel/solarPanel.announcement";
import { SolarPanelModelStatus } from "@/features/solar-panel/solarPanel.enum";
export const panelOffer: SolarPanelAnnouncement = {
  id: "story-panel",
  slug: "painel-450",
  companySlug: "aurora",
  supplierId: "story-company",
  company: { id: "story-company", slug: "aurora", tradeName: "Aurora Solar" },
  panel: { id: "story-model", productType: "PANEL", status: SolarPanelModelStatus.APPROVED, powerOutput: 450, efficiency: 22, brand: "Aurora" },
  title: "Painel solar 450 W",
  description: "Oferta de teste",
  unitPrice: 680,
  availableUnits: 20,
  serviceRegions: ["SP"],
  photos: {
    heroImage: { url: "https://res.cloudinary.com/solaria/image/upload/mocks/solar-panels-f2b8091a5514.webp", description: "Painel solar" },
    otherImages: [],
  },
};
export const infrastructureOffer: SolarPanelAnnouncement = {
  ...panelOffer,
  id: "story-infrastructure",
  slug: "trilho-aluminio",
  title: "Trilho de alumínio",
  unitPrice: 85,
  panel: {
    id: "story-rail",
    productType: "INFRASTRUCTURE",
    infrastructureType: "RAIL",
    material: "Alumínio",
    status: SolarPanelModelStatus.APPROVED,
  },
  photos: {
    heroImage: { url: "https://res.cloudinary.com/solaria/image/upload/mocks/infrastructure-d9a5baac44f0.webp", description: "Trilho de alumínio" },
    otherImages: [],
  },
};
