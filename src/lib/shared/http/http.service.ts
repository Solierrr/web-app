import logger from "@/config/logging/logger";
import i18n from "@/config/i18n/internationalization";
import { getSelectedContext } from "@/features/access/access.onboarding.service";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";

export class HttpResponseError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    public readonly detail?: string,
  ) {
    super(`HTTP ${status}`);
  }
}

export function getHttpErrorMessage(error: unknown, fallback: string): string {
  const response = error instanceof HttpResponseError ? error : error instanceof Error ? error.cause : null;
  if (response instanceof HttpResponseError && /^[A-Z][A-Z0-9_]{0,79}$/.test(response.code)) {
    const key = `errors:${response.code}`;
    if (i18n.exists(key)) return i18n.t(key);
  }
  return fallback;
}

export function getHttpStatus(error: unknown): number | null {
  const cause = error instanceof HttpResponseError ? error : error instanceof Error ? error.cause : null;
  return cause instanceof HttpResponseError ? cause.status : null;
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface HttpJsonOptions {
  service: string;
  operation: string;
  errorMessage: string;
  method?: HttpMethod;
  body?: unknown;
  authenticated?: boolean;
  timeoutMs?: number;
}

export async function httpJson<T>(url: string, options: HttpJsonOptions): Promise<T> {
  const { service, operation, errorMessage, method = "GET", body, authenticated = true, timeoutMs } = options;

  const accessToken = authenticated ? getAuthSession()?.accessToken : undefined;
  const headers: Record<string, string> = {};
  const multipart = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !multipart) headers["Content-Type"] = "application/json";
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  const selectedCompany = authenticated ? getSelectedContext() : null;
  if (
    url.startsWith(`${import.meta.env.VITE_API_CORE}/api/`) &&
    selectedCompany &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedCompany)
  ) {
    headers["X-Company-Id"] = selectedCompany;
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers,
      body: multipart ? (body as FormData) : body === undefined ? undefined : JSON.stringify(body),
      signal: timeoutMs ? AbortSignal.timeout(timeoutMs) : undefined,
    });
  } catch (error) {
    logger.serviceError({ service, operation, error });
    throw new Error(errorMessage, { cause: error });
  }

  if (!response.ok) {
    const error = new Error(`${service}.${operation} returned HTTP ${response.status}`);
    let code = "HTTP_ERROR";
    let detail: string | undefined;
    try {
      const data = await response.json();
      if (data && typeof data === "object") {
        if (typeof data.detail === "string" && data.detail.length <= 2000) detail = data.detail;
        if (typeof data.errorCode === "string") code = data.errorCode;
        else if (typeof data.code === "string") code = data.code;
        else if (typeof data.status === "string") code = data.status;
      }
    } catch {
      code = "HTTP_ERROR";
    }
    const cause = new HttpResponseError(response.status, code, detail);
    logger.serviceError({
      service,
      operation,
      status: response.status,
      errorCode: /^[A-Z][A-Z0-9_]{0,79}$/.test(code) ? code : "HTTP_ERROR",
      error,
    });
    throw new Error(getHttpErrorMessage(cause, errorMessage), { cause });
  }

  if (response.status === 204) return undefined as T;

  try {
    return await response.json();
  } catch (error) {
    logger.serviceError({ service, operation, error });
    throw new Error(errorMessage, { cause: error });
  }
}
