export interface ProfessionalReview {
  id: string;
  status: "UNDER_ANALYSIS" | "APPROVED" | "REJECTED";
  crea: string;
  person: { name: string };
}
