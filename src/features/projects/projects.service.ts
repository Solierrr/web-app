import i18n from "@/config/i18n/internationalization";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import { httpJson } from "@/lib/shared/http/http.service";
import { API_CORE_URL } from "@/lib/shared/http/apiCore.utils";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { mockProjectRequest, mockPhotoBlob } from "./projects.d.mocks";
import type {
  Project,
  ProjectDraft,
  ProjectOptions,
  ProjectMember,
  ProjectRole,
  ProjectInvitation,
  InvitationDraft,
  ProjectActivity,
  ActivityDraft,
  ProjectHistory,
  ProjectPhoto,
  ProjectStatus,
} from "./projects.d";
async function request<T>(path: string, method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET", body?: unknown): Promise<T> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    return mockProjectRequest(path, method, body) as Promise<T>;
  }
  return httpJson<T>(`${API_CORE_URL}/projects${path}`, {
    service: "core",
    operation: "projects",
    errorMessage: i18n.t("saas:projects.feedback.failed"),
    method,
    body,
  });
}
export const projectApi = {
  list: (companyId?: string) => request<Project[]>(companyId ? `?companyId=${encodeURIComponent(companyId)}` : ""),
  options: (companyId?: string) => request<ProjectOptions>(`/options${companyId ? `?companyId=${encodeURIComponent(companyId)}` : ""}`),
  detail: (id: string) => request<Project>(`/${id}`),
  save: (draft: ProjectDraft, id?: string) => request<Project>(id ? `/${id}` : "", id ? "PUT" : "POST", draft),
  status: (id: string, status: ProjectStatus) => request<Project>(`/${id}/status`, "PATCH", { status }),
  archive: (id: string) => request<void>(`/${id}`, "DELETE"),
  members: (id: string) => request<ProjectMember[]>(`/${id}/members`),
  member: (id: string, uid: string, role: ProjectRole, functionName: string) =>
    request<ProjectMember>(`/${id}/members/${uid}`, "PATCH", { role, functionName }),
  removeMember: (id: string, uid: string) => request<void>(`/${id}/members/${uid}`, "DELETE"),
  inbox: () => request<ProjectInvitation[]>("/invitations/me"),
  invitations: (id: string) => request<ProjectInvitation[]>(`/${id}/invitations`),
  invite: (id: string, draft: InvitationDraft) => request<ProjectInvitation[]>(`/${id}/invitations`, "POST", draft),
  respond: (id: string, accept: boolean) => request<ProjectInvitation>(`/invitations/${id}/response?accept=${accept}`, "POST"),
  resend: (id: string) => request<ProjectInvitation>(`/invitations/${id}/resend`, "POST"),
  revoke: (id: string) => request<ProjectInvitation>(`/invitations/${id}`, "DELETE"),
  agenda: (id: string) => request<ProjectActivity[]>(`/${id}/activities`),
  activity: (id: string, draft: ActivityDraft, activityId?: string) =>
    request<ProjectActivity>(`/${id}/activities${activityId ? `/${activityId}` : ""}`, activityId ? "PUT" : "POST", draft),
  activityStatus: (id: string, aid: string, status: ProjectStatus) =>
    request<ProjectActivity>(`/${id}/activities/${aid}/status`, "PATCH", { status }),
  history: (id: string) => request<ProjectHistory[]>(`/${id}/history`),
  photos: (id: string) => request<ProjectPhoto[]>(`/${id}/photos`),
  upload: (id: string, file: File, cover: boolean) => {
    const body = new FormData();
    body.set("file", file);
    return request<ProjectPhoto>(`/${id}/photos?cover=${cover}`, "POST", body);
  },
  removePhoto: (id: string, pid: string) => request<void>(`/${id}/photos/${pid}`, "DELETE"),
  cover: (id: string, pid: string) => request<ProjectPhoto>(`/${id}/photos/${pid}/cover`, "PATCH"),
};
export async function projectPhotoBlob(id: string, photoId: string, signal?: AbortSignal) {
  if (isAlwaysMockMode()) return mockPhotoBlob(id, photoId);
  const response = await fetch(`${API_CORE_URL}/projects/${id}/photos/${photoId}/content`, {
    headers: { Authorization: `Bearer ${getAuthSession()?.accessToken ?? ""}` },
    signal,
  });
  if (!response.ok) throw new Error(i18n.t("saas:projects.feedback.failed"));
  return response.blob();
}
