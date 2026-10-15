import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import ProjectHistoryView from "./ProjectHistoryView";
import { history } from "./ProjectSections.stories.fixtures";
const meta = {
  title: "Features/Projects/History",
  component: ProjectHistoryView,
  args: { items: history, busy: false, onRefresh: () => undefined },
} satisfies Meta<typeof ProjectHistoryView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Timeline: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Buscar evento ou pessoa" }), "foto");
    await expect(canvas.getByText("Foto da estrutura do telhado adicionada.")).toBeVisible();
    await expect(canvas.queryByText("Projeto criado")).not.toBeInTheDocument();
  },
};
export const Loading: Story = { args: { items: null } };
export const Empty: Story = { args: { items: [] } };
