import { httpJson } from "@/shared/http/http.service";
import { API_CORE_URL } from "@/shared/http/apiCore.utils";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import type { ProfessionalReview } from "./review.d";
import { getMockProfessionalReviews, decideMockProfessional } from "./review.d.mocks";

export async function listProfessionalReviews(): Promise<ProfessionalReview[]> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return getMockProfessionalReviews();
  }
  return httpJson<ProfessionalReview[]>(`${API_CORE_URL}/technicians`, {
    service: "professionalReview",
    operation: "listProfessionalReviews",
    errorMessage: "Não foi possível carregar os profissionais em análise",
  });
}

export async function decideProfessional(id: string, approved: boolean): Promise<void> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    decideMockProfessional(id, approved);
    return;
  }
  await httpJson(`${API_CORE_URL}/technicians/${encodeURIComponent(id)}/${approved ? "approval" : "rejection"}`, {
    service: "professionalReview",
    operation: "decideProfessional",
    method: "POST",
    errorMessage: "Não foi possível analisar o profissional",
  });
}
