import type { Meta, StoryObj } from "@storybook/react-vite";
import Skeleton from "./Skeleton";
import { ImageSkeleton } from "./Skeleton.presets";

const meta = {
  title: "Feedback/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { width: 240, height: 24 },
};

export const Circle: Story = {
  args: { width: 64, height: 64, className: "rounded-full" },
};

export const Image: Story = {
  render: () => <ImageSkeleton className="w-40" />,
};
