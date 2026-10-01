import { CompanyStatus } from "./company.enum";

export type RegistrationStage = "MANUAL_REVIEW" | "APPROVED" | "REJECTED";

export function getRegistrationStage(status: CompanyStatus): RegistrationStage {
  if (status === CompanyStatus.APPROVED) return "APPROVED";
  if (status === CompanyStatus.REJECTED) return "REJECTED";
  return "MANUAL_REVIEW";
}
