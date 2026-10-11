import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import ProjectMembersView from "./ProjectMembersView";
import { members } from "./ProjectSections.stories.fixtures";
const meta = {
  title: "Features/Projects/Participants",
  component: ProjectMembersView,
  args: { items: members, busy: false, onRefresh: () => undefined },
} satisfies Meta<typeof ProjectMembersView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Participants: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Buscar participante ou função" }), "instalação");
    await expect(canvas.getByText("Bruno Costa")).toBeVisible();
    await expect(canvas.queryByText("Ana Silva")).not.toBeInTheDocument();
  },
};
export const Loading: Story = { args: { items: null } };
export const Empty: Story = { args: { items: [] } };
