import type { Meta, StoryObj } from "@storybook/react-vite";
import Copyright from "./Copyright";

const meta = {
  title: "Brand/Copyright",
  component: Copyright,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Copyright>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
