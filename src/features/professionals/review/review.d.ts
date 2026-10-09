export interface ProfessionalReview {
  id: string;
  status: "UNDER_ANALYSIS" | "APPROVED" | "REJECTED";
  crea: string;
  certNr10Url?: string;
  certNr35Url?: string;
  person: { name: string };
}
