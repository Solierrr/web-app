export interface Brand {
  id: string;
  ownerCompanyId: string | null;
  name: string;
  visibility: "PRIVATE" | "PUBLIC";
  archived: boolean;
  legacy: boolean;
  logoUrl?: string | null;
  referenceUrl?: string | null;
  revision: number;
  pending?: boolean;
}
export interface BrandPayload {
  name: string;
  logoUrl?: string | null;
  referenceUrl?: string | null;
}
export interface BrandRequest {
  id: string;
  brandId: string;
  requesterCompanyId: string | null;
  kind: "PUBLICATION" | "CORRECTION";
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  proposedName: string;
  proposedLogoUrl?: string | null;
  proposedReferenceUrl?: string | null;
  resultBrandId?: string | null;
  decisionReason?: string | null;
  createdAt: string;
  decidedAt?: string | null;
  revision: number;
}
