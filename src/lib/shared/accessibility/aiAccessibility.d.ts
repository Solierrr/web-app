export type ImagePurpose = "product" | "company_profile" | "professional_profile";

export type ImageDecision = "approved" | "review_required" | "rejected";

export interface ImageAnalysis {
  analysis_id: string;
  request_id: string;
  decision: ImageDecision;
  reason_codes: string[];
  risk_categories: string[];
  alt_text: string | null;
  policy_version: string;
  model_version: string;
}

export type ImageBlockReason = "inappropriate" | "purpose" | "invalid" | "review";

export type ImageVerdict =
  | { status: "suggested"; altText: string }
  | { status: "unavailable"; failure?: string }
  | { status: "blocked"; reason: ImageBlockReason };

export interface ImageAnalysisOptions {
  purpose: ImagePurpose;
  contextTitle?: string;
  maxAltChars?: number;
  strictPurpose?: boolean;
}
