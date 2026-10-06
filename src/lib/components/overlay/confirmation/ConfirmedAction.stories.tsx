import type { Meta, StoryObj } from "@storybook/react-vite";
import ConfirmedAction from "./ConfirmedAction";

const meta = {
  title: "Overlay/Confirmation/Action",
  component: ConfirmedAction,
  args: { label: "Excluir", name: "Item", onConfirm: () => Promise.resolve() },
} satisfies Meta<typeof ConfirmedAction>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
