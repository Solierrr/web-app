import i18n from "@/config/i18n/internationalization";
import { httpJson } from "@/lib/shared/http/http.service";
import { API_CORE_URL } from "@/lib/shared/http/apiCore.utils";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import type {
  ProfessionalAccount,
  ProfessionalDocumentInfo,
  ProfessionalDraft,
  ProfessionalPolicy,
  ProfessionalSubmission,
} from "./professional.submission";

function request<T>(path: string, method: "GET" | "POST" | "PUT" = "GET", body?: unknown): Promise<T> {
  return httpJson<T>(`${API_CORE_URL}${path}`, {
    service: "professional",
    operation: "submission",
    method,
    body,
    errorMessage: i18n.t("deeplink:errors.UNAVAILABLE"),
  });
}

export const getProfessionalAccount = () => request<ProfessionalAccount>("/professional-onboarding/me");
export const saveProfessionalDraft = (draft: ProfessionalDraft) => request<ProfessionalAccount>("/professional-onboarding/me/draft", "PUT", draft);
export const submitProfessional = (revision: number) =>
  request<ProfessionalSubmission>("/professional-onboarding/me/submissions", "POST", { revision });
export const getProfessionalPolicy = (id: string) => request<ProfessionalPolicy>(`/professions/${encodeURIComponent(id)}/requirements`);
export const getSubmission = (id: string) => request<ProfessionalSubmission>(`/professional-onboarding/me/submissions/${encodeURIComponent(id)}`);
export const listSubmissionReviews = (page = 0) => request<ProfessionalSubmission[]>(`/professional-review/submissions?page=${page}`);
export const decideSubmission = (id: string, revision: number, approved: boolean, reason: string) =>
  request<ProfessionalSubmission>(`/professional-review/submissions/${encodeURIComponent(id)}/decision`, "POST", { revision, approved, reason });

export async function uploadProfessionalDocument(kind: string, file: File): Promise<ProfessionalDocumentInfo> {
  if (
    file.size === 0 ||
    file.size > 10 * 1024 * 1024 ||
    !["image/jpeg", "image/png", "image/webp", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(
      file.type,
    )
  )
    throw new Error(i18n.t("deeplink:professional.fileError"));
  const body = new FormData();
  body.set("file", file);
  body.set("kind", kind);
  return request<ProfessionalDocumentInfo>("/professional-onboarding/me/documents", "POST", body);
}

export async function getProfessionalDocument(id: string): Promise<string> {
  const response = await fetch(`${API_CORE_URL}/professional-onboarding/documents/${encodeURIComponent(id)}/content`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${getAuthSession()?.accessToken ?? ""}` },
  });
  if (!response.ok) throw new Error(i18n.t("deeplink:errors.UNAVAILABLE"));
  return URL.createObjectURL(await response.blob());
}

export const getReviewSubmission = (id: string) => request<ProfessionalSubmission>(`/professional-review/submissions/${encodeURIComponent(id)}`);
export const listReviewQueue = () => request<{ id: string; name: string; registrationNumber: string }[]>("/professional-review/queue");
export const getDocumentInfo = (id: string) => request<ProfessionalDocumentInfo>(`/professional-onboarding/documents/${encodeURIComponent(id)}`);
export async function loadProfessionalDocument(id: string): Promise<Blob> {
  const response = await fetch(`${API_CORE_URL}/professional-onboarding/documents/${encodeURIComponent(id)}/content`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${getAuthSession()?.accessToken ?? ""}` },
  });
  if (!response.ok) throw new Error(i18n.t("deeplink:errors.UNAVAILABLE"));
  return response.blob();
}
