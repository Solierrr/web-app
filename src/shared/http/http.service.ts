import logger from "@/config/logging/logger";

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

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
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

  try {
    return await response.json();
  } catch (error) {
    logger.serviceError({ service, operation, error });
    throw new Error(errorMessage, { cause: error });
  }
}
