import { HttpResponseError } from "@/lib/shared/http/http.service";
import type { Project, ProjectStatus } from "./projects.d";
export function isProjectReadOnly(p: Project) {
  return p.archived || p.status === "COMPLETED" || p.status === "CANCELED";
}
export function projectError(error: unknown, fallback: string) {
  return error instanceof Error && error.cause instanceof HttpResponseError
    ? (error.cause.detail ?? fallback)
    : error instanceof Error
      ? error.message
      : fallback;
}
export function localDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
export function isoDate(value: string) {
  return value ? new Date(value).toISOString() : null;
}
export function statusState(status: ProjectStatus) {
  return status === "COMPLETED" ? "approved" : status === "CANCELED" ? "cancelled" : "pending";
}
