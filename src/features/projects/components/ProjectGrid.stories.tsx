import type { Meta, StoryObj } from "@storybook/react-vite";
import ProjectGrid from "./ProjectGrid";
import { projectApi } from "../projects.service";
const meta = {
  title: "Features/Projects/Grid",
  component: ProjectGrid,
  beforeEach: () => {
    const original = projectApi.photos;
    projectApi.photos = async () => [];
    return () => {
      projectApi.photos = original;
    };
  },
  args: {
    onRefresh: async () => undefined,
    rowAction: () => null,
    projects: ["Instalação residencial", "Ampliação da usina", "Revisão preventiva"].map((name, i) => ({
      id: `project-${i}`,
      name,
      description: "Acompanhamento de etapas, equipe e documentação do projeto solar.",
      ownerCompanyId: null,
      ownerUserId: "demo",
      status: i === 1 ? "IN_PROGRESS" : "OPEN",
      archived: false,
      role: "OWNER",
      canManage: true,
      canContribute: true,
      createdAt: "2026-10-13T12:00:00Z",
      location: { city: "São Paulo", state: "SP" },
    })),
  },
} satisfies Meta<typeof ProjectGrid>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Projects: Story = {};
export const Loading: Story = { args: { projects: null } };
export const Empty: Story = { args: { projects: [] } };
