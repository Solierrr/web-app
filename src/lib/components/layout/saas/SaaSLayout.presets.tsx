import { routePaths } from "@/config/inter/paths";
import type { SaaSNavigationGroup } from "@/features/saas/saas";

interface NavigationContext {
  company: boolean;
  companyType: "SUPPLIER" | "DEMANDANT" | null;
  platformAdmin: boolean;
  pendingRegistration?: boolean;
  can?: (permission: string) => boolean;
}

export function getOperationalNavigation({ company, companyType, platformAdmin, pendingRegistration = false, can = () => true }: NavigationContext): SaaSNavigationGroup[] {
  return [
    {
      key: "overview",
      label: "navigation.groups.overview",
      items: [
        { key: "dashboard", label: "navigation.items.dashboard", icon: "home", to: routePaths.dashboard },
        { key: "messages", label: "navigation.items.messages", icon: "messages", to: routePaths.inbox },
        ...(pendingRegistration
          ? [{ key: "registrationStatus", label: "navigation.items.registrationStatus", icon: "building" as const, to: routePaths.registrationStatus }]
          : []),
        ...(company || platformAdmin
          ? [{ key: "chatbot", label: "navigation.items.chatbot", icon: "messages" as const, to: routePaths.operationalChatbot }]
          : []),
      ],
    },
    ...(company
      ? [
          {
            key: "company",
            label: "navigation.groups.company",
            items: [
              { key: "companyProfile", label: "navigation.items.companyProfile", icon: "building" as const, to: routePaths.ownCompanyProfile },
              ...(companyType === "SUPPLIER"
                ? [
                    ...(can("GET /api/models")
                      ? [
                          {
                            key: "solarPanelModels",
                            label: "navigation.items.solarPanelModels",
                            icon: "panels" as const,
                            to: routePaths.solarPanelModelsCrud,
                          },
                        ]
                      : []),
                    ...(can("GET /api/offers/company/{companyId}")
                      ? [{ key: "offers", label: "navigation.items.offers", icon: "shoppingCart" as const, to: routePaths.offersManagement }]
                      : []),
                  ]
                : []),
              ...(companyType === "DEMANDANT" && can("GET /api/local-units/company/{companyId}")
                ? [{ key: "units", label: "navigation.items.units", icon: "building" as const, to: routePaths.unitsManagement }]
                : []),
              ...(companyType && can("GET /api/user-companies/company/{companyId}")
                ? [{ key: "employees", label: "navigation.items.employees", icon: "users" as const, to: routePaths.employeesManagement }]
                : []),
            ],
          },
        ]
      : []),
    ...(platformAdmin
      ? [
          {
            key: "administration",
            label: "navigation.groups.administration",
            items: [
              { key: "registrations", label: "navigation.items.registrations", icon: "settings" as const, to: routePaths.registrationsManagement },
            ],
          },
        ]
      : []),
  ];
}
