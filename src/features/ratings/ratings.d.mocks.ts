import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { mockHttpError } from "@/features/messages/messages.messenger.d.mocks";
import type { Rating, RatingStatus, RatingType } from "./ratings.service";

// As avaliações simuladas valem para todos os usuários do navegador, como as do servidor.
const KEY = "solaria.mock.ratings";

function readAll(): Rating[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveAll(ratings: Rating[]) {
  localStorage.setItem(KEY, JSON.stringify(ratings));
}

export function listMockRatings(evaluatedId: string): Rating[] {
  return readAll().filter((item) => item.evaluatedId === evaluatedId);
}

export function createMockRating(input: { evaluatedId: string; typeRate: RatingType; rating: number; comment?: string }): Rating {
  const rating: Rating = {
    id: crypto.randomUUID(),
    evaluatorId: getAuthSession()?.userId ?? "mock-user",
    evaluatedId: input.evaluatedId,
    typeRate: input.typeRate,
    comment: input.comment ?? null,
    rating: input.rating,
    status: "ACTIVE",
    timestamp: new Date().toISOString(),
  };
  saveAll([...readAll(), rating]);
  return rating;
}

/** Como no servidor, só quem avaliou altera. */
export function updateMockRating(id: string, patch: { rating?: number; comment?: string; status?: RatingStatus }): Rating {
  const current = readAll().find((item) => item.id === id);
  if (!current) throw mockHttpError(404, "RESOURCE_NOT_FOUND");
  if (current.evaluatorId !== (getAuthSession()?.userId ?? "mock-user")) throw mockHttpError(403, "UNAUTHORIZED_ACCESS");
  const updated = { ...current, ...patch };
  saveAll(readAll().map((item) => (item.id === id ? updated : item)));
  return updated;
}
