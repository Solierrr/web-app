import { professionalMocks } from "@/config/mocks/registry";
import type { ProfessionalReview } from "./review.d";

const STORAGE_KEY = "solaria.mock.professionalReviews";

export function getMockProfessionalReviews(): ProfessionalReview[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    return [];
  }
  return professionalMocks.map((item) => ({
    id: item.id,
    person: { name: item.name },
    crea: item.registrations?.[0]?.number ?? "",
    status: "UNDER_ANALYSIS",
  }));
}

export function decideMockProfessional(id: string, approved: boolean): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(getMockProfessionalReviews().map((item) => (item.id === id ? { ...item, status: approved ? "APPROVED" : "REJECTED" } : item))),
  );
}
