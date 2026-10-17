import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import ProjectAgendaView from "./ProjectAgendaView";
import { activities, members } from "./ProjectSections.stories.fixtures";
const meta = {
  title: "Features/Projects/Agenda",
  component: ProjectAgendaView,
  args: { items: activities, members, busy: false, onRefresh: () => undefined, rowAction: () => null },
} satisfies Meta<typeof ProjectAgendaView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Schedule: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Buscar atividade ou responsável" }), "reunião");
    await expect(canvas.getByText("Reunião de alinhamento")).toBeVisible();
    await expect(canvas.queryByText("Vistoria do telhado")).not.toBeInTheDocument();
  },
};
export const Loading: Story = { args: { items: null } };
export const Empty: Story = { args: { items: [] } };
