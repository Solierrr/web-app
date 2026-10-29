import type { ImageAnalysis, ImageVerdict } from "./aiAccessibility";

const TECHNICAL_CODES = new Set(["PROVIDER_UNAVAILABLE", "ANALYSIS_INCOMPLETE", "ANALYSIS_INVALID", "CAPTION_INVALID", "PURPOSE_UNSUPPORTED"]);
const PURPOSE_CODES = new Set(["PURPOSE_MISMATCH", "PURPOSE_UNCERTAIN"]);
const FILE_CODES = new Set(["INVALID_IMAGE", "IMAGE_TOO_LARGE", "IMAGE_DIMENSIONS_EXCEEDED"]);

/**
 * Traduz a decisão do serviço no que o upload pode fazer. Só `approved` libera o texto sugerido;
 * rejeição e revisão por risco impedem o envio, e falha técnica do serviço nunca bloqueia.
 */
export function toImageVerdict(analysis: ImageAnalysis, strictPurpose = true): ImageVerdict {
  const codes = analysis.reason_codes;
  if (analysis.decision === "approved") {
    const altText = analysis.alt_text?.trim();
    return altText ? { status: "suggested", altText } : { status: "unavailable" };
  }
  if (codes.length > 0 && codes.every((code) => TECHNICAL_CODES.has(code))) return { status: "unavailable" };
  if (!strictPurpose && codes.length > 0 && codes.every((code) => PURPOSE_CODES.has(code))) return { status: "unavailable" };
  if (codes.some((code) => FILE_CODES.has(code))) return { status: "blocked", reason: "invalid" };
  if (analysis.decision === "rejected") {
    return { status: "blocked", reason: codes.some((code) => PURPOSE_CODES.has(code)) ? "purpose" : "inappropriate" };
  }
  return { status: "blocked", reason: codes.some((code) => PURPOSE_CODES.has(code)) ? "purpose" : "review" };
}
