import i18n from "@/config/i18n/internationalization";
import { httpJson } from "@/lib/shared/http/http.service";
import { withFailureMessage } from "@/lib/shared/http/httpFailure.utils";
import { retryAfterRefresh } from "@/lib/shared/auth/authRetry.utils";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";

const API = `${import.meta.env.VITE_API_VALIDATION}/api/v1`;
const SERVICE_NAME = "aiValidation";
const TIMEOUT_MS = 120_000;

export interface CnpjValidationResult {
  status: "VALID" | "INVALID";
  cnpj: string;
  company_name: string | null;
  trade_name: string | null;
  is_active: boolean;
  matched_category: string | null;
  error_code: string | null;
  reason: string;
}

export interface CertificateValidationResult {
  status: "ACCEPT" | "REJECTED";
  reason: string;
  error_code: string | null;
  extracted_data: Record<string, unknown> | null;
}

async function post<T>(path: string, operation: string, body: unknown, errorMessage: string): Promise<T> {
  try {
    return await retryAfterRefresh(() =>
      httpJson<T>(`${API}${path}`, { service: SERVICE_NAME, operation, method: "POST", body, timeoutMs: TIMEOUT_MS, errorMessage }),
    );
  } catch (error) {
    throw withFailureMessage(error, errorMessage);
  }
}

export async function validateCnpjCategory(cnpj: string): Promise<CnpjValidationResult> {
  if (isAlwaysMockMode("AI")) {
    await waitForMockService();
    return {
      status: "VALID",
      cnpj,
      company_name: null,
      trade_name: null,
      is_active: true,
      matched_category: "SUPPLIER",
      error_code: null,
      reason: "Validação simulada.",
    };
  }
  return post("/companies/validate-cnpj", "validateCnpjCategory", { cnpj }, i18n.t("services:aiValidation.validateCnpjCategory"));
}

export async function validateCertificates(certNr10Url: string, certNr35Url: string): Promise<CertificateValidationResult> {
  if (isAlwaysMockMode("AI")) {
    await waitForMockService();
    return { status: "ACCEPT", reason: "", error_code: null, extracted_data: null };
  }
  return post(
    "/certificates/validate",
    "validateCertificates",
    { cert_nr10_url: certNr10Url, cert_nr35_url: certNr35Url },
    i18n.t("services:aiValidation.validateCertificates"),
  );
}
