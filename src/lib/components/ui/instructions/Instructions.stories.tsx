import type { Meta, StoryObj } from "@storybook/react-vite";
import Instructions from "./Instructions";
const meta = { title: "UI/Instructions", component: Instructions, args: { items: ["Ctrl", "K"] } } satisfies Meta<typeof Instructions>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Shortcut: Story = {};
export const Message: Story = { args: { items: ["Shift", "Enter"] } };
