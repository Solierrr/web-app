import type { Meta, StoryObj } from "@storybook/react-vite";
import Logo from "./Logo";
const meta = { title: "Brand/Logo", component: Logo, args: { width: 3 } } satisfies Meta<typeof Logo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Large: Story = { args: { width: 6 } };
