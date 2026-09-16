import logger from "@/config/logging/logger";
import { getAuthSession } from "@/shared/auth/authToken.utils";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface HttpJsonOptions {
  service: string;
  operation: string;
  errorMessage: string;
  method?: HttpMethod;
  body?: unknown;
}

export async function httpJson<T>(url: string, options: HttpJsonOptions): Promise<T> {
  const { service, operation, errorMessage, method = "GET", body } = options;

  const accessToken = getAuthSession()?.accessToken;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    logger.serviceError({ service, operation, error });
    throw new Error(errorMessage, { cause: error });
  }

  if (!response.ok) {
    const error = new Error(`${service}.${operation} returned HTTP ${response.status}`);
    logger.serviceError({ service, operation, status: response.status, error });
    throw new Error(errorMessage, { cause: error });
  }

  if (response.status === 204) return undefined as T;

  try {
    return await response.json();
  } catch (error) {
    logger.serviceError({ service, operation, error });
    throw new Error(errorMessage, { cause: error });
  }
}
