import i18n from "@/config/i18n/internationalization";
import { getHttpErrorMessage, HttpResponseError } from "@/lib/shared/http/http.service";

export function getAccessHttpError(error: unknown): HttpResponseError | null {
  if (error instanceof HttpResponseError) return error;
  return error instanceof Error && error.cause instanceof HttpResponseError ? error.cause : null;
}

export function getAccessErrorMessage(error: unknown, fallback: string): string {
  const response = getAccessHttpError(error);
  if (response) {
    if (response.code === "INVALID_OR_EXPIRED_TOKEN") return i18n.t("access:feedback.invalidLink");
    if (response.code === "EMAIL_UNAVAILABLE" || response.code === "EMAIL_NOT_CONFIGURED") return i18n.t("access:feedback.emailUnavailable");
    if (response.code === "PASSWORD_POLICY") return i18n.t("access:feedback.passwordPolicy");
    if (response.status === 408 || response.status === 504) return i18n.t("access:feedback.connection");
    if (response.status >= 500) return i18n.t("access:feedback.unavailable");
    if (response.status === 429) return i18n.t("access:feedback.tooManyAttempts");
    return getHttpErrorMessage(response, fallback);
  }
  const cause = error instanceof Error && error.cause ? error.cause : error;
  const code = cause && typeof cause === "object" && "code" in cause ? cause.code : undefined;
  if (code === "auth/network-request-failed" || cause instanceof TypeError || (typeof navigator !== "undefined" && !navigator.onLine))
    return i18n.t("access:feedback.connection");
  if (code === "auth/too-many-requests") return i18n.t("access:feedback.tooManyAttempts");
  if (code === "auth/popup-blocked") return i18n.t("access:feedback.popupBlocked");
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return i18n.t("access:feedback.cancelled");
  if (code === "auth/operation-not-allowed" || code === "auth/unauthorized-domain" || code === "auth/invalid-api-key")
    return i18n.t("access:feedback.providerUnavailable");
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") return i18n.t("access:login.error");
  return fallback;
}
