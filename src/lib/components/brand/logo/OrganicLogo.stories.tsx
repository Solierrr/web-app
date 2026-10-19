import type { Meta, StoryObj } from "@storybook/react-vite";
import OrganicLogo from "./OrganicLogo";

const meta = { title: "Brand/Organic logo", component: OrganicLogo, args: { width: 3 } } satisfies Meta<typeof OrganicLogo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Sidebar: Story = { args: { width: 2.5, holdMs: 5000, transitionMs: 500 } };
export const ErrorPage: Story = { args: { width: 8, holdMs: 2500, transitionMs: 500, rotateShape: true } };
export const Interactive: Story = { args: { width: 7, interactive: true } };
