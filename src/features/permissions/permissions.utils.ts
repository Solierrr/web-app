import type { PermissionTemplate } from "./permissions.d";

const files = import.meta.glob<PermissionTemplate>("./templates/*.json", { eager: true, import: "default" });

export const permissionTemplates = Object.values(files);

export function isPermissionCompatible(permission: string, companyType: "SUPPLIER" | "DEMANDANT"): boolean {
  if (/ \/api\/(models|offers|model-photos|inventories|suppliers)(\/|$)/.test(permission)) return companyType === "SUPPLIER";
  if (/ \/api\/(local-units|requesters|local-unit-photos|unit-specifications|energy-bills)(\/|$)/.test(permission))
    return companyType === "DEMANDANT";
  return true;
}

export function getPermissionTemplate(title: string): PermissionTemplate | undefined {
  const template = permissionTemplates.find((item) => item.title === title);
  return template ? { ...template, companyTypes: [...template.companyTypes], permissions: [...template.permissions] } : undefined;
}
