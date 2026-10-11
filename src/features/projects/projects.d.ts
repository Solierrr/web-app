export type ProjectStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";
export type ProjectRole = "OWNER" | "MANAGER" | "MEMBER" | "VIEWER";
export interface ProjectLocation { state?: string; city?: string; neighborhood?: string; zipCode?: string; street?: string; number?: string; complement?: string }
export interface ProjectDraft { name: string; description?: string; ownerCompanyId: string | null; localUnitId?: string | null; location?: ProjectLocation | null; startDate?: string | null; endDate?: string | null }
export interface Project extends ProjectDraft { id: string; ownerUserId: string | null; ownerName?: string; status: ProjectStatus; archived: boolean; role: ProjectRole; canManage: boolean; canContribute: boolean; createdAt: string }
export interface ProjectMember { id: string; userId: string; authId: string; name: string; role: ProjectRole; functionName: string | null }
export interface ProjectInvitation { id: string; projectId: string; projectName: string; email: string; role: ProjectRole; functionName: string | null; status: "PENDING" | "ACCEPTED" | "DECLINED" | "REVOKED"; expiresAt: string; emailState: "PENDING" | "SENT" | "FAILED" }
export interface InvitationDraft { email?: string; teamId?: string; role: ProjectRole; functionName?: string; locale: string }
export type ActivityType = "SERVICE" | "VISIT" | "MEETING" | "OTHER";
export interface ActivityDraft { title: string; description?: string; type: ActivityType; startsAt: string; endsAt: string; onsite: boolean; assigneeIds: string[] }
export interface ProjectActivity extends Omit<ActivityDraft, "endsAt"> { id: string; projectId: string; endsAt: string | null; status: ProjectStatus; technicalServiceId: string | null }
export interface ProjectHistory { id: string; action: string; detail: string; createdAt: string; actor: string }
export interface ProjectPhoto { id: string; name: string; mime: string; cover: boolean; size: number; createdAt: string }
export interface ProjectOptions { units: {id: string; name: string}[]; teams: {id: string; name: string}[] }
