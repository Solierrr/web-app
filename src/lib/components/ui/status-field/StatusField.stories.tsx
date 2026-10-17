import type { Meta, StoryObj } from "@storybook/react-vite";
import StatusField from "./StatusField";

const meta = {
  title: "UI/StatusField",
  component: StatusField,
  args: { state: "approved", label: "Aprovada" },
} satisfies Meta<typeof StatusField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Approved: Story = {};
export const Rejected: Story = { args: { state: "rejected", label: "Recusada" } };
export const Pending: Story = { args: { state: "pending", label: "Em análise" } };
