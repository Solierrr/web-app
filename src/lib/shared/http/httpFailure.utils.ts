import i18n from "@/config/i18n/internationalization";
import { getHttpStatus } from "./http.service";

export type HttpFailureKind =
  "unauthorized" | "forbidden" | "rateLimited" | "unavailable" | "timeout" | "network" | "tooLarge" | "invalid" | "unknown";

export function classifyHttpFailure(error: unknown): HttpFailureKind {
  const status = getHttpStatus(error);
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 429) return "rateLimited";
  if (status === 413) return "tooLarge";
  if (status === 400 || status === 422) return "invalid";
  if (status !== null && status >= 500) return "unavailable";
  const cause = error instanceof Error ? error.cause : error;
  if (cause instanceof DOMException && (cause.name === "TimeoutError" || cause.name === "AbortError")) return "timeout";
  if (cause instanceof TypeError) return "network";
  return "unknown";
}

export function describeAiFailure(error: unknown, fallback: string): string {
  const kind = classifyHttpFailure(error);
  return kind === "unknown" || kind === "invalid" ? fallback : i18n.t(`services:aiFailures.${kind}`);
}

export function withFailureMessage(error: unknown, fallback: string): Error {
  return new Error(describeAiFailure(error, fallback), { cause: error instanceof Error && error.cause ? error.cause : error });
}
