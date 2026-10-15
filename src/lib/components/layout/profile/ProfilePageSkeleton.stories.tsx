import type { Meta, StoryObj } from "@storybook/react-vite";
import ProfilePageSkeleton from "./ProfilePageSkeleton";
const meta = { title: "Layout/Profile/Skeleton", component: ProfilePageSkeleton, parameters: { layout: "fullscreen" } } satisfies Meta<
  typeof ProfilePageSkeleton
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Public: Story = {};
export const Operational: Story = { args: { operational: true } };
