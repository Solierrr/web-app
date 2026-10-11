import { getOperationalAccount } from "@/features/access/access.onboarding.service";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import type {
  Project,
  ProjectDraft,
  ProjectMember,
  ProjectInvitation,
  InvitationDraft,
  ProjectActivity,
  ActivityDraft,
  ProjectHistory,
  ProjectPhoto,
  ProjectOptions,
} from "./projects.d";
import { isProjectReadOnly } from "./projects.utils";
interface State {
  projects: Project[];
  members: Record<string, ProjectMember[]>;
  invites: ProjectInvitation[];
  activities: Record<string, ProjectActivity[]>;
  history: Record<string, ProjectHistory[]>;
  photos: Record<string, ProjectPhoto[]>;
  scopes: string[];
}
const uid = () => getAuthSession()?.userId ?? "local-user";
const email = () => getAuthSession()?.email.toLowerCase() ?? "local@solaria.test";
const key = () => `solaria.mock.projects.v1.${uid()}`;
const stamp = () => new Date().toISOString();
function seed(): State {
  const state: State = { projects: [], members: {}, invites: [], activities: {}, history: {}, photos: {}, scopes: [] };
  const id = "demo-invitation-project";
  state.projects.push({
    id,
    name: "Revisão do sistema fotovoltaico",
    description: "Inspeção dos módulos e acompanhamento da geração de energia.",
    ownerCompanyId: "inviting-company",
    ownerUserId: null,
    status: "OPEN",
    archived: false,
    role: "VIEWER",
    canManage: false,
    canContribute: false,
    createdAt: stamp(),
    location: { city: "Campinas", state: "SP", street: "Avenida Brasil", number: "120" },
  });
  state.members[id] = [
    { id: "external-owner", userId: "external-owner", authId: "external-owner", name: "Equipe Solaria", role: "OWNER", functionName: "Responsável" },
  ];
  state.invites.push({
    id: "demo-received-invitation",
    projectId: id,
    projectName: state.projects[0].name,
    email: email(),
    role: "MEMBER",
    functionName: "Técnico",
    status: "PENDING",
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    emailState: "SENT",
  });
  return state;
}
function load(): State {
  try {
    return JSON.parse(localStorage.getItem(key()) ?? "null") ?? seed();
  } catch {
    return seed();
  }
}
function save(s: State) {
  localStorage.setItem(key(), JSON.stringify(s));
}
function record(s: State, id: string, detail: string, action = "UPDATED") {
  (s.history[id] ??= []).unshift({ id: crypto.randomUUID(), action, detail, createdAt: stamp(), actor: email() });
}
const ownerName = (id: string | null) =>
  id ? (getOperationalAccount().memberships.find((m) => m.id === id)?.name ?? "Empresa de demonstração") : email();
const unitLocation = { city: "São Paulo", state: "SP", street: "Rua das Acácias", number: "240", zipCode: "01311000" };
function addScope(s: State, companyId: string | null) {
  const scope = companyId ?? "personal";
  if (s.scopes.includes(scope)) return;
  s.scopes.push(scope);
  const samples = ["Instalação residencial — Jardim Europa", "Ampliação da usina — Unidade Central", "Revisão preventiva — São Paulo"];
  samples.forEach((name, index) => {
    const id = crypto.randomUUID();
    const status = index === 1 ? "IN_PROGRESS" : index === 2 ? "COMPLETED" : "OPEN";
    const p: Project = {
      id,
      name,
      description: "Projeto de energia solar com acompanhamento de etapas, envolvidos e documentação privada.",
      ownerCompanyId: companyId,
      ownerUserId: companyId ? null : uid(),
      ownerName: ownerName(companyId),
      status,
      archived: false,
      role: "OWNER",
      canManage: true,
      canContribute: status !== "COMPLETED",
      createdAt: stamp(),
      location: { city: "São Paulo", state: "SP", street: "Rua das Acácias", number: "240", zipCode: "01311000" },
    };
    s.projects.push(p);
    s.members[id] = [
      { id: crypto.randomUUID(), userId: uid(), authId: uid(), name: email(), role: "OWNER", functionName: "Responsável" },
      {
        id: crypto.randomUUID(),
        userId: "demo-technician",
        authId: "demo-technician",
        name: "Marina Costa",
        role: "MEMBER",
        functionName: "Técnica",
      },
    ];
    s.activities[id] = [
      {
        id: crypto.randomUUID(),
        projectId: id,
        title: "Visita técnica inicial",
        description: "Conferência da estrutura e do local de instalação.",
        type: "VISIT",
        status: index === 2 ? "COMPLETED" : "OPEN",
        startsAt: new Date(Date.now() + 86400000).toISOString(),
        endsAt: new Date(Date.now() + 90000000).toISOString(),
        onsite: true,
        assigneeIds: ["demo-technician"],
        technicalServiceId: null,
      },
    ];
    record(s, id, "Projeto criado", "CREATED");
  });
}
function access(s: State, id: string, manage = false, write = false) {
  const p = s.projects.find((x) => x.id === id);
  const m = s.members[id]?.find((x) => x.userId === uid());
  if (!p || !m) throw new Error("Projeto indisponível para esta conta.");
  const manager = m.role === "OWNER" || m.role === "MANAGER";
  if (manage && !manager) throw new Error("Apenas responsáveis podem gerenciar o projeto.");
  if (write && (isProjectReadOnly(p) || m.role === "VIEWER")) throw new Error("Projeto disponível apenas para consulta.");
  return { ...p, role: m.role, canManage: manager, canContribute: m.role !== "VIEWER" && !isProjectReadOnly(p) };
}
const pending = (s: State, id: string) => (s.activities[id] ?? []).some((a) => a.status === "OPEN" || a.status === "IN_PROGRESS");
const options: ProjectOptions = {
  units: [{ id: "demo-unit", name: "Unidade Central — São Paulo" }],
  teams: [{ id: "demo-team", name: "Equipe de instalação" }],
};
export async function mockProjectRequest(path: string, method: string, body?: unknown): Promise<unknown> {
  const s = load();
  const [pathname, query = ""] = path.split("?");
  const parts = pathname.split("/").filter(Boolean);
  const params = new URLSearchParams(query);
  const id = parts[0];
  let result: unknown;
  if (!id) {
    if (method === "GET") {
      const co = params.get("companyId");
      addScope(s, co);
      result = s.projects
        .filter((p) => (!co || p.ownerCompanyId === co) && s.members[p.id]?.some((m) => m.userId === uid()))
        .map((p) => access(s, p.id));
    } else {
      const d = body as ProjectDraft;
      if (!d.name.trim()) throw new Error("Informe o nome do projeto.");
      const p: Project = {
        ...d,
        id: crypto.randomUUID(),
        ownerUserId: d.ownerCompanyId ? null : uid(),
        ownerName: ownerName(d.ownerCompanyId),
        location: d.localUnitId ? unitLocation : d.location,
        role: "OWNER",
        canManage: true,
        canContribute: true,
        status: "OPEN",
        archived: false,
        createdAt: stamp(),
      };
      s.projects.push(p);
      s.members[p.id] = [{ id: crypto.randomUUID(), userId: uid(), authId: uid(), name: email(), role: "OWNER", functionName: "Responsável" }];
      record(s, p.id, "Projeto criado", "CREATED");
      result = p;
    }
  } else if (id === "options") result = params.has("companyId") ? options : { units: [], teams: [] };
  else if (id === "invitations") {
    if (parts[1] === "me")
      result = s.invites.filter((i) => i.email === email() && i.status === "PENDING" && new Date(i.expiresAt).getTime() > Date.now());
    else {
      const i = s.invites.find((x) => x.id === parts[1]);
      if (!i) throw new Error("Convite indisponível.");
      if (parts[2] === "response") {
        if (i.email !== email() || i.status !== "PENDING" || new Date(i.expiresAt).getTime() <= Date.now())
          throw new Error("Convite expirado ou indisponível.");
        const p = s.projects.find((x) => x.id === i.projectId)!;
        if (isProjectReadOnly(p)) throw new Error("O projeto está disponível apenas para consulta.");
        i.status = params.get("accept") === "true" ? "ACCEPTED" : "DECLINED";
        if (i.status === "ACCEPTED") {
          (s.members[i.projectId] ??= []).push({
            id: crypto.randomUUID(),
            userId: uid(),
            authId: uid(),
            name: email(),
            role: i.role,
            functionName: i.functionName,
          });
        }
        record(s, i.projectId, i.status === "ACCEPTED" ? "Convite aceito" : "Convite recusado", i.status);
        result = i;
      } else {
        access(s, i.projectId, true, true);
        if (i.status !== "PENDING") throw new Error("Convite já respondido.");
        if (method === "DELETE") i.status = "REVOKED";
        else {
          i.expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
          i.emailState = "PENDING";
        }
        result = i;
        record(s, i.projectId, method === "DELETE" ? "Convite revogado" : "Convite reenviado");
      }
    }
  } else {
    const write = method !== "GET";
    const management = write && parts[1] !== "photos" && !(parts[1] === "activities" && parts[3] === "status");
    const p = access(s, id, management, write && parts[1] !== "status" && !(parts.length === 1 && method === "DELETE"));
    const stored = s.projects.find((x) => x.id === id)!;
    if (parts.length === 1) {
      if (method === "GET") result = p;
      else if (method === "PUT") {
        const d = body as ProjectDraft;
        if (d.ownerCompanyId !== p.ownerCompanyId) throw new Error("Propriedade imutável.");
        Object.assign(stored, d, { location: d.localUnitId ? unitLocation : d.location });
        record(s, id, "Informações atualizadas");
        result = access(s, id);
      } else {
        if (pending(s, id)) throw new Error("Conclua ou cancele atividades pendentes antes de arquivar.");
        stored.archived = true;
        record(s, id, "Projeto arquivado", "ARCHIVED");
      }
    } else if (parts[1] === "status") {
      const next = (body as { status: Project["status"] }).status;
      if (stored.archived) throw new Error("Projeto arquivado.");
      if ((next === "COMPLETED" || next === "CANCELED") && pending(s, id)) throw new Error("Conclua ou cancele as atividades pendentes.");
      stored.status = next;
      record(s, id, `Situação alterada: ${next}`, "STATUS");
      result = access(s, id);
    } else if (parts[1] === "members") {
      if (!write) result = s.members[id] ?? [];
      else {
        const m = s.members[id]?.find((x) => x.userId === parts[2]);
        if (!m) throw new Error("Participante indisponível.");
        if (m.role === "OWNER") throw new Error("Proprietário imutável.");
        if (method === "DELETE") s.members[id] = s.members[id].filter((x) => x !== m);
        else Object.assign(m, body);
        record(s, id, "Participantes atualizados", "MEMBER_UPDATED");
        result = m;
      }
    } else if (parts[1] === "invitations") {
      if (!write) {
        access(s, id, true);
        result = s.invites.filter((i) => i.projectId === id);
      } else {
        const d = body as InvitationDraft;
        const targets = d.teamId ? ["tecnico@solaria.test", "auxiliar@solaria.test"] : [d.email?.trim().toLowerCase()];
        if (d.role === "OWNER") throw new Error("Propriedade imutável.");
        result = targets.map((target) => {
          if (
            !target ||
            target === email() ||
            s.invites.some((i) => i.projectId === id && i.email === target && i.status === "PENDING" && new Date(i.expiresAt).getTime() > Date.now())
          )
            throw new Error("Destinatário inválido ou convite já pendente.");
          const i: ProjectInvitation = {
            id: crypto.randomUUID(),
            projectId: id,
            projectName: p.name,
            email: target,
            role: d.role,
            functionName: d.functionName ?? null,
            status: "PENDING",
            expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
            emailState: "PENDING",
          };
          s.invites.push(i);
          return i;
        });
        record(s, id, "Convite registrado (mock local; nenhum e-mail enviado)", "INVITED");
      }
    } else if (parts[1] === "activities") {
      const rows = (s.activities[id] ??= []);
      if (!write) result = rows;
      else if (parts[3] === "status") {
        const a = rows.find((x) => x.id === parts[2]);
        if (!a) throw new Error("Atividade indisponível.");
        if (!p.canManage && !a.assigneeIds.includes(uid())) throw new Error("Atividade atribuída a outro participante.");
        const next = (body as { status: Project["status"] }).status;
        if (
          a.status === "COMPLETED" ||
          a.status === "CANCELED" ||
          (next === "COMPLETED" && a.status !== "IN_PROGRESS") ||
          (next === "IN_PROGRESS" && a.status !== "OPEN")
        )
          throw new Error("Transição inválida.");
        if (
          next === "IN_PROGRESS" &&
          (!a.assigneeIds.length ||
            a.assigneeIds.some((u) => !s.members[id].some((m) => m.userId === u && m.role !== "VIEWER")) ||
            (a.onsite && (!p.location?.city || !p.location?.street || !p.location?.state)))
        )
          throw new Error("Defina responsáveis ativos e o local da atividade presencial.");
        a.status = next;
        record(s, id, `Atividade: ${a.title} — ${next}`, "ACTIVITY_STATUS");
        result = a;
      } else {
        const d = body as ActivityDraft;
        if (new Date(d.endsAt) <= new Date(d.startsAt)) throw new Error("O término precisa ser posterior ao início.");
        if (d.assigneeIds.some((u) => !s.members[id].some((m) => m.userId === u && m.role !== "VIEWER"))) throw new Error("Responsável inválido.");
        const a = parts[2] ? rows.find((x) => x.id === parts[2]) : undefined;
        if (parts[2] && (!a || a.status !== "OPEN" || a.type !== d.type))
          throw new Error("Somente atividades planejadas podem ser editadas; tipo imutável.");
        if (a) {
          Object.assign(a, d);
          result = a;
        } else {
          const added: ProjectActivity = {
            ...d,
            id: crypto.randomUUID(),
            projectId: id,
            status: "OPEN",
            technicalServiceId: d.type === "SERVICE" ? crypto.randomUUID() : null,
          };
          rows.push(added);
          result = added;
        }
        record(s, id, `Agenda atualizada: ${d.title}`, "ACTIVITY_UPDATED");
      }
    } else if (parts[1] === "history") result = s.history[id] ?? [];
    else if (parts[1] === "photos") {
      const rows = (s.photos[id] ??= []);
      if (!write) result = rows;
      else if (method === "POST") {
        const file = (body as FormData).get("file") as File;
        if (!["image/jpeg", "image/png"].includes(file.type) || file.size > 8 * 1024 * 1024 || !file.size)
          throw new Error("Envie uma foto JPEG ou PNG de até 8 MB.");
        if (rows.length >= 30) throw new Error("Limite de 30 fotos por projeto.");
        const photo: ProjectPhoto = {
          id: crypto.randomUUID(),
          name: file.name,
          mime: file.type,
          size: file.size,
          cover: params.get("cover") === "true",
          createdAt: stamp(),
        };
        if (photo.cover) {
          if (!p.canManage) throw new Error("Apenas responsáveis podem definir a capa.");
          rows.forEach((x) => (x.cover = false));
        }
        await photoStore(`${uid()}:${id}:${photo.id}`, file);
        rows.push(photo);
        record(s, id, "Foto adicionada", "PHOTO_ADDED");
        result = photo;
      } else {
        access(s, id, true, true);
        const photo = rows.find((x) => x.id === parts[2]);
        if (!photo) throw new Error("Foto indisponível.");
        if (method === "DELETE") {
          await photoStore(`${uid()}:${id}:${photo.id}`, null);
          s.photos[id] = rows.filter((x) => x !== photo);
          record(s, id, "Foto removida", "PHOTO_REMOVED");
        } else {
          rows.forEach((x) => (x.cover = false));
          photo.cover = true;
          record(s, id, "Capa atualizada", "COVER_UPDATED");
          result = photo;
        }
      }
    }
  }
  save(s);
  return structuredClone(result);
}
function photoDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open("solaria-project-mock-photos", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("photos");
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
async function photoStore(key: string, blob: Blob | null) {
  const db = await photoDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("photos", "readwrite");
      if (blob) tx.objectStore("photos").put(blob, key);
      else tx.objectStore("photos").delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
export async function mockPhotoBlob(projectId: string, photoId: string): Promise<Blob> {
  access(load(), projectId);
  const db = await photoDatabase();
  try {
    return await new Promise<Blob>((resolve, reject) => {
      const r = db.transaction("photos").objectStore("photos").get(`${uid()}:${projectId}:${photoId}`);
      r.onsuccess = () => (r.result ? resolve(r.result) : reject(new Error("Foto indisponível.")));
      r.onerror = () => reject(r.error);
    });
  } finally {
    db.close();
  }
}
