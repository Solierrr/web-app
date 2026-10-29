import i18n from "@/config/i18n/internationalization";
import { getHttpStatus, httpJson } from "@/lib/shared/http/http.service";
import { describeAiFailure } from "@/lib/shared/http/httpFailure.utils";
import { retryAfterRefresh } from "@/lib/shared/auth/authRetry.utils";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import type { ImageAnalysis, ImageAnalysisOptions, ImagePurpose, ImageVerdict } from "./aiAccessibility";
import { toImageVerdict } from "./aiAccessibility.utils";

const API = `${import.meta.env.VITE_API_ACCESSIBILITY?.replace(/\/$/, "")}/v1`;
const SERVICE_NAME = "aiAccessibility";
const TIMEOUT_MS = 120_000;
const DEFAULT_MAX_ALT_CHARS = 150;

const MOCK_ALT_TEXT: Record<ImagePurpose, string> = {
  product: "Painel solar fotovoltaico com moldura de alumínio sobre fundo claro",
  company_profile: "Fachada de uma empresa de energia solar com o logotipo à vista",
  professional_profile: "Retrato de um profissional sorrindo, com uniforme de trabalho",
};

async function mockAnalysis(file: File, purpose: ImagePurpose): Promise<ImageAnalysis> {
  await waitForMockService();
  const rejected = /(blocked|nsfw|inadequad)/i.test(file.name);
  return {
    analysis_id: crypto.randomUUID(),
    request_id: crypto.randomUUID(),
    decision: rejected ? "rejected" : "approved",
    reason_codes: rejected ? ["SEXUAL_CONTENT"] : [],
    risk_categories: rejected ? ["SEXUAL_CONTENT"] : [],
    alt_text: rejected ? null : MOCK_ALT_TEXT[purpose],
    policy_version: "mock",
    model_version: "mock",
  };
}

export function requestImageAnalysis(file: File, options: ImageAnalysisOptions): Promise<ImageAnalysis> {
  if (isAlwaysMockMode("AI")) return mockAnalysis(file, options.purpose);
  const errorMessage = i18n.t("services:aiAccessibility.analyzeImage");
  return retryAfterRefresh(() => {
    const body = new FormData();
    body.set("image", file);
    body.set("purpose", options.purpose);
    body.set("request_id", crypto.randomUUID());
    if (options.contextTitle) body.set("context_title", options.contextTitle.slice(0, 120));
    body.set("max_alt_chars", String(options.maxAltChars ?? DEFAULT_MAX_ALT_CHARS));
    return httpJson<ImageAnalysis>(`${API}/images/analyze`, {
      service: SERVICE_NAME,
      operation: "analyzeImage",
      method: "POST",
      body,
      timeoutMs: TIMEOUT_MS,
      errorMessage,
    });
  });
}

export async function analyzeImage(file: File, options: ImageAnalysisOptions): Promise<ImageVerdict> {
  try {
    return toImageVerdict(await requestImageAnalysis(file, options), options.strictPurpose ?? true);
  } catch (error) {
    if (getHttpStatus(error) === 413) return { status: "blocked", reason: "invalid" };
    return { status: "unavailable", failure: describeAiFailure(error, i18n.t("services:aiAccessibility.analyzeImage")) };
  }
}
