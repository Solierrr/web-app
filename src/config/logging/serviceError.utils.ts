import logger from "./logger";

export function createServiceError(service: string, operation: string, message: string, cause?: unknown): Error {
  const error = new Error(message, cause === undefined ? undefined : { cause });
  if (cause && typeof cause === "object" && "code" in cause) Object.assign(error, { code: cause.code });
  logger.serviceError({ service, operation, error: cause ?? error });
  return error;
}
