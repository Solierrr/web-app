import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Project, ProjectInvitation, ProjectActivity } from "./projects.d";
const current = vi.hoisted(() => ({ userId: "owner-auth", email: "owner@solaria.test" }));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => current }));
import { mockProjectRequest as request } from "./projects.d.mocks";
const call = <T>(path: string, method = "GET", body?: unknown) => request(path, method, body) as Promise<T>;
async function project() {
  return call<Project>("", "POST", {
    name: "Projeto de teste",
    ownerCompanyId: null,
    location: { street: "Rua de teste", city: "São Paulo", state: "SP" },
  });
}
describe("private project workflow", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
      clear: () => store.clear(),
    });
    current.userId = "owner-auth";
    current.email = "owner@solaria.test";
  });
  it("preserves ownership on edit", async () => {
    const p = await project();
    await expect(call(`/${p.id}`, "PUT", { name: "Outro", ownerCompanyId: "another-company" })).rejects.toThrow("Propriedade");
  });
  it("cannot conclude or archive pending work", async () => {
    const p = await project();
    await call(`/${p.id}/activities`, "POST", {
      title: "Visita",
      type: "VISIT",
      startsAt: "2026-10-15T10:00:00Z",
      endsAt: "2026-10-15T11:00:00Z",
      assigneeIds: [current.userId],
      onsite: true,
    });
    await expect(call(`/${p.id}/status`, "PATCH", { status: "COMPLETED" })).rejects.toThrow("pendentes");
    await expect(call(`/${p.id}`, "DELETE")).rejects.toThrow("pendentes");
  });
  it("requires location to start onsite work", async () => {
    const p = await project();
    await call(`/${p.id}`, "PUT", { name: p.name, ownerCompanyId: null, location: null });
    const a = await call<ProjectActivity>(`/${p.id}/activities`, "POST", {
      title: "Visita",
      type: "VISIT",
      startsAt: "2026-10-15T10:00:00Z",
      endsAt: "2026-10-15T11:00:00Z",
      assigneeIds: [current.userId],
      onsite: true,
    });
    await expect(call(`/${p.id}/activities/${a.id}/status`, "PATCH", { status: "IN_PROGRESS" })).rejects.toThrow("local");
  });
  it("starts and completes an activity before completing its project", async () => {
    const p = await project();
    const a = await call<ProjectActivity>(`/${p.id}/activities`, "POST", {
      title: "Visita",
      type: "VISIT",
      startsAt: "2026-10-15T10:00:00Z",
      endsAt: "2026-10-15T11:00:00Z",
      assigneeIds: [current.userId],
      onsite: true,
    });
    await call(`/${p.id}/activities/${a.id}/status`, "PATCH", { status: "IN_PROGRESS" });
    await expect(call(`/${p.id}/activities/${a.id}/status`, "PATCH", { status: "IN_PROGRESS" })).rejects.toThrow("Transição");
    await call(`/${p.id}/activities/${a.id}/status`, "PATCH", { status: "COMPLETED" });
    const completed = await call<Project>(`/${p.id}/status`, "PATCH", { status: "COMPLETED" });
    expect(completed.canContribute).toBe(false);
    await expect(call(`/${p.id}`, "PUT", { name: "Editar", ownerCompanyId: null })).rejects.toThrow("consulta");
  });
  it("invitations do not grant access before acceptance", async () => {
    const incoming = await call<ProjectInvitation[]>("/invitations/me");
    expect(incoming).toHaveLength(1);
    await expect(call(`/${incoming[0].projectId}`)).rejects.toThrow("indisponível");
    await call(`/invitations/${incoming[0].id}/response?accept=true`, "POST");
    const accepted = await call<Project>(`/${incoming[0].projectId}`);
    expect(accepted.role).toBe("MEMBER");
    expect(accepted.canManage).toBe(false);
    await expect(call(`/invitations/${incoming[0].id}/response?accept=true`, "POST")).rejects.toThrow("indisponível");
  });
  it("refuses duplicate invitations and permits revocation", async () => {
    const p = await project();
    const draft = { email: "guest@solaria.test", role: "MEMBER", locale: "pt-BR" };
    const [i] = await call<ProjectInvitation[]>(`/${p.id}/invitations`, "POST", draft);
    await expect(call(`/${p.id}/invitations`, "POST", draft)).rejects.toThrow("pendente");
    await call(`/invitations/${i.id}`, "DELETE");
    expect((await call<ProjectInvitation[]>(`/${p.id}/invitations`))[0].status).toBe("REVOKED");
  });
  it("does not expose another account's local project data", async () => {
    const p = await project();
    current.userId = "other-auth";
    current.email = "other@solaria.test";
    await expect(call(`/${p.id}`)).rejects.toThrow("indisponível");
  });
});
