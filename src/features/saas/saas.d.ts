export type SaaSRole = "admin" | "supplier" | "demandant";
export type CompanyType = "SUPPLIER" | "DEMANDANT";

export interface OperationalContext {
  companyId: string;
  companyType: CompanyType;
  companyStatus: "UNDER_ANALYSIS" | "APPROVED" | "REJECTED";
  positionName: string;
  admin: boolean;
  permissions: string[];
}

export interface SaaSNavigationItem {
  key: string;
  label: string;
  icon: import("@@/ui/icon/Icon").IconName;
  to: (lang: import("@/config/inter/browser/languages").SupportedLanguage) => string;
}

export interface SaaSNavigationGroup {
  key: string;
  label: string;
  items: SaaSNavigationItem[];
}
