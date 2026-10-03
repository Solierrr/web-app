import i18n from "@/config/i18n/internationalization";
import { httpJson } from "@/lib/shared/http/http.service";
import { API_CORE_URL } from "@/lib/shared/http/apiCore.utils";

const SERVICE_NAME = "platformAdmin";

export interface PlatformAdmin {
  id: string;
  userId: string;
}

// GET /api/platform-admins/me retorna 204 (corpo vazio) quando o usuário
// atual não é Admin Solaria — httpJson resolve isso como `undefined`.
export async function getMyPlatformAdmin(): Promise<PlatformAdmin | null> {
  const admin = await httpJson<PlatformAdmin | undefined>(`${API_CORE_URL}/platform-admins/me`, {
    service: SERVICE_NAME,
    operation: "getMyPlatformAdmin",
    errorMessage: i18n.t("services:platformAdmin.getMyPlatformAdmin"),
  });
  return admin ?? null;
}
