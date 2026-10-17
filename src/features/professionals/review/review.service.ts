import i18n from "@/config/i18n/internationalization";
import { httpJson } from "@/lib/shared/http/http.service";
import { API_CORE_URL } from "@/lib/shared/http/apiCore.utils";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import { listReviewQueue } from "../professional.submission.service";
import type { ProfessionalReview } from "./review.d";
import { getMockProfessionalReviews, decideMockProfessional } from "./review.d.mocks";

export async function listProfessionalReviews(): Promise<ProfessionalReview[]> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return getMockProfessionalReviews();
  }
  const submissions = await listReviewQueue();
  return submissions.map((item) => ({ id: item.id, status: "UNDER_ANALYSIS", crea: item.registrationNumber ?? "", person: { name: item.name } }));
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
    errorMessage: i18n.t("services:professionalReview.decideProfessional"),
  });
}
