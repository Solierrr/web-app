import { permissionTemplates } from "./permissions.utils";
import type { Permission, PositionPermission } from "@/features/companies/companyManagement.service";

function permissionLabel(permissionName: string): string {
  if (permissionName === "POST /auth/password/change") return "Alterar própria senha";
  if (permissionName === "POST /auth/password/recovery") return "Recuperar própria senha";
  const [method, path] = permissionName.split(" ");
  const actions: Record<string, string> = { GET: "Consultar", POST: "Cadastrar", PUT: "Editar", PATCH: "Alterar", DELETE: "Remover" };
  const resources: Record<string, string> = {
    offers: "ofertas",
    models: "modelos",
    "local-units": "unidades",
    "access-codes": "códigos de acesso",
    "user-companies": "funcionários",
    positions: "cargos",
    "company-positions": "cargos da empresa",
    "position-permissions": "permissões dos cargos",
    permissions: "permissões disponíveis",
    suppliers: "dados de fornecedor",
    requesters: "dados de demandante",
    addresses: "endereços",
    geolocalizations: "localizações",
  };
  return `${actions[method] ?? "Gerenciar"} ${resources[path?.split("/")[2]] ?? "acessos"}`;
}

export const permissionMocks: Permission[] = [...new Set(permissionTemplates.flatMap((template) => template.permissions))].map((permissionName) => ({
  id: permissionName,
  permissionName,
  name: permissionLabel(permissionName),
  description: permissionLabel(permissionName),
}));

const STORAGE_KEY = "solaria.mock.positionPermissions";

export function getMockPositionPermissions(): PositionPermission[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveMockPositionPermissions(items: PositionPermission[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
