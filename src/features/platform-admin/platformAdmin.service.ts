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
    errorMessage: "Não foi possível verificar o status de Admin Solaria",
  });
  return admin ?? null;
}
