import i18n from "@/config/i18n/internationalization";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import { httpJson } from "@/lib/shared/http/http.service";
import { createMockRating, listMockRatings, updateMockRating } from "./ratings.d.mocks";

const base = `${import.meta.env.VITE_API_MESSENGER?.replace(/\/$/, "")}/messaging/ratings`;
const options = (operation: string) => ({ service: "messenger", operation, errorMessage: i18n.t(`services:messenger.${operation}`) });

export type RatingType = "PROFISSIONAL" | "PRODUTO";
export type RatingStatus = "ACTIVE" | "EXCLUDED" | "DOWN";

/** Avaliação como o messenger guarda: nota de 0.0 a 5.0 e comentário de até 1000 caracteres. */
export interface Rating {
  id: string;
  evaluatorId: string;
  evaluatedId: string;
  typeRate: RatingType;
  comment: string | null;
  rating: number;
  status: RatingStatus;
  timestamp: string;
}

/** Avaliações recebidas por uma pessoa ou produto; quem chama filtra as que não estão ativas. */
export async function listRatingsOf(evaluatedId: string): Promise<Rating[]> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return listMockRatings(evaluatedId);
  }
  return httpJson<Rating[]>(`${base}/evaluated/${encodeURIComponent(evaluatedId)}`, options("listRatings"));
}

export async function createRating(input: { evaluatedId: string; typeRate: RatingType; rating: number; comment?: string }): Promise<Rating> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return createMockRating(input);
  }
  return httpJson<Rating>(base, { ...options("saveRating"), method: "POST", body: input });
}

/** Só quem avaliou edita a nota ou o comentário. */
export async function updateRating(id: string, patch: { rating?: number; comment?: string }): Promise<Rating> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return updateMockRating(id, patch);
  }
  return httpJson<Rating>(`${base}/${encodeURIComponent(id)}`, { ...options("saveRating"), method: "PATCH", body: patch });
}

/** Excluir é marcar como `EXCLUDED`: a avaliação sai da média e da lista. */
export async function excludeRating(id: string): Promise<Rating> {
  if (isAlwaysMockMode("MESSENGER")) {
    await waitForMockService();
    return updateMockRating(id, { status: "EXCLUDED" });
  }
  return httpJson<Rating>(`${base}/${encodeURIComponent(id)}/status`, { ...options("deleteRating"), method: "PATCH", body: { status: "EXCLUDED" } });
}

/** Média das avaliações ativas com uma casa decimal; `null` sem nenhuma. */
export function averageRating(ratings: Rating[]): number | null {
  const active = ratings.filter((item) => item.status === "ACTIVE");
  if (active.length === 0) return null;
  return Math.round((active.reduce((sum, item) => sum + item.rating, 0) / active.length) * 10) / 10;
}
