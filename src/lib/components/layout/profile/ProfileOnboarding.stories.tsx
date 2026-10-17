import type { Meta, StoryObj } from "@storybook/react-vite";
import ProfileOnboarding from "./ProfileOnboarding";
import { fn } from "storybook/test";
const meta = {
  title: "Layout/Profile/Onboarding",
  component: ProfileOnboarding,
  args: { kind: "user", name: "Ana Silva", onComplete: fn() },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ProfileOnboarding>;
export default meta;
type Story = StoryObj<typeof meta>;
export const User: Story = {};
export const Company: Story = { args: { kind: "company", name: "Aurora Solar" } };
