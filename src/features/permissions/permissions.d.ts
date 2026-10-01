export interface PermissionTemplate {
  title: string;
  companyTypes: ("SUPPLIER" | "DEMANDANT")[];
  permissions: string[];
}
