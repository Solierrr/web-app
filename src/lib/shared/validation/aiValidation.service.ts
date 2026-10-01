import { httpJson } from "@/lib/shared/http/http.service";

const API = `${import.meta.env.VITE_API_VALIDATION}/api/v1`;
const SERVICE_NAME = "aiValidation";

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

export function validateCnpjCategory(cnpj: string): Promise<CnpjValidationResult> {
  return httpJson<CnpjValidationResult>(`${API}/companies/validate-cnpj`, {
    service: SERVICE_NAME,
    operation: "validateCnpjCategory",
    method: "POST",
    body: { cnpj },
    authenticated: false,
    errorMessage: "Não foi possível validar o CNPJ",
  });
}

export function validateCertificates(certNr10Url: string, certNr35Url: string): Promise<CertificateValidationResult> {
  return httpJson<CertificateValidationResult>(`${API}/certificates/validate`, {
    service: SERVICE_NAME,
    operation: "validateCertificates",
    method: "POST",
    body: { cert_nr10_url: certNr10Url, cert_nr35_url: certNr35Url },
    authenticated: false,
    errorMessage: "Não foi possível validar os certificados",
  });
}
