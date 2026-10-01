import { routePaths } from "@/config/inter/paths";
import type { SaaSNavigationGroup, SaaSRole } from "./saas";

export const saasNavigation: Record<SaaSRole, SaaSNavigationGroup[]> = {
  admin: [
    {
      key: "overview",
      label: "navigation.groups.overview",
      items: [
        {
          key: "dashboard",
          label: "navigation.items.dashboard",
          icon: "home",
          to: routePaths.adminDashboard,
        },
      ],
    },
    {
      key: "catalog",
      label: "navigation.groups.catalog",
      items: [
        {
          key: "solarPanelModels",
          label: "navigation.items.solarPanelModels",
          icon: "settings",
          to: routePaths.solarPanelModelsCrud,
        },
      ],
    },
  ],
  supplier: [
    {
      key: "overview",
      label: "navigation.groups.overview",
      items: [
        {
          key: "dashboard",
          label: "navigation.items.dashboard",
          icon: "home",
          to: routePaths.supplierDashboard,
        },
      ],
    },
  ],
  demandant: [
    {
      key: "overview",
      label: "navigation.groups.overview",
      items: [
        {
          key: "dashboard",
          label: "navigation.items.dashboard",
          icon: "home",
          to: routePaths.demandantDashboard,
        },
      ],
    },
  ],
};
