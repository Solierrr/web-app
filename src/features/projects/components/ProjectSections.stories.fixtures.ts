import type { ProjectActivity, ProjectHistory, ProjectMember } from "../projects.d";
export const members: ProjectMember[] = [
  { id: "ana", userId: "ana", authId: "ana", name: "Ana Silva", role: "OWNER", functionName: "Responsável pelo projeto" },
  { id: "bruno", userId: "bruno", authId: "bruno", name: "Bruno Costa", role: "MEMBER", functionName: "Instalação e revisão" },
  { id: "carol", userId: "carol", authId: "carol", name: "Carol Souza", role: "VIEWER", functionName: null },
];
export const activities: ProjectActivity[] = [
  {
    id: "visit",
    projectId: "demo",
    title: "Vistoria do telhado",
    description: "Verificar estrutura, sombreamento e pontos de conexão.",
    type: "VISIT",
    startsAt: "2026-10-13T12:00:00Z",
    endsAt: "2026-10-13T13:30:00Z",
    onsite: true,
    assigneeIds: ["bruno"],
    status: "IN_PROGRESS",
    technicalServiceId: null,
  },
  {
    id: "meeting",
    projectId: "demo",
    title: "Reunião de alinhamento",
    description: "Revisar o cronograma com os envolvidos.",
    type: "MEETING",
    startsAt: "2026-10-13T17:00:00Z",
    endsAt: "2026-10-13T17:45:00Z",
    onsite: false,
    assigneeIds: ["ana", "bruno"],
    status: "OPEN",
    technicalServiceId: null,
  },
  {
    id: "service",
    projectId: "demo",
    title: "Revisão da instalação",
    type: "SERVICE",
    startsAt: "2026-10-14T12:00:00Z",
    endsAt: null,
    onsite: true,
    assigneeIds: [],
    status: "COMPLETED",
    technicalServiceId: "service-demo",
  },
];
export const history: ProjectHistory[] = [
  { id: "created", action: "CREATED", detail: "Projeto criado", createdAt: "2026-10-12T12:00:00Z", actor: "Ana Silva" },
  {
    id: "invite",
    action: "INVITE_ACCEPTED",
    detail: "Bruno Costa aceitou o convite para o projeto.",
    createdAt: "2026-10-12T15:00:00Z",
    actor: "Bruno Costa",
  },
  { id: "photo", action: "PHOTO_ADDED", detail: "Foto da estrutura do telhado adicionada.", createdAt: "2026-10-13T12:00:00Z", actor: "Bruno Costa" },
  {
    id: "status",
    action: "ACTIVITY_STATUS",
    detail: "Atividade: Vistoria do telhado — IN_PROGRESS",
    createdAt: "2026-10-13T12:10:00Z",
    actor: "Ana Silva",
  },
];
