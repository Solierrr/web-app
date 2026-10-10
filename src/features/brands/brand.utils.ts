import i18n from "@/config/i18n/internationalization";
import { getHttpErrorMessage, HttpResponseError } from "@/lib/shared/http/http.service";
export function brandServiceError(error: unknown): Error {
  const cause = error instanceof Error ? error.cause : null;
  if (cause instanceof HttpResponseError) {
    const translated = getHttpErrorMessage(cause, "");
    if (translated) return new Error(translated, { cause });
    if (cause.status === 401) return new Error(i18n.t("brands:sessionExpired"));
    if (cause.status === 403) return new Error(i18n.t("brands:permissionDenied"));
    if (cause.status === 409) return new Error(i18n.t("brands:conflict"));
  }
  return error instanceof Error ? error : new Error(i18n.t("brands:serviceError"));
}

export const normalizeBrand = (name: string) => name.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
