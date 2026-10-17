import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProfileHead } from "./ProfileHead";
import { avatar, banner } from "../../../../../.storybook/fixtures";
const meta = {
  title: "Layout/Profile/Head",
  component: ProfileHead,
  args: { background: banner, profileImage: avatar },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ProfileHead>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
