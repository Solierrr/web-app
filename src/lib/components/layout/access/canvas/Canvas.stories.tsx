import type { Meta, StoryObj } from "@storybook/react-vite";
import Canvas from "./Canvas";
const meta = {
  title: "Layout/Canvas",
  component: Canvas,
  args: { variant: "grid" },
  decorators: [
    (Story) => (
      <div className="relative h-96 w-full overflow-hidden rounded-hard bg-operational-surface">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Canvas>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Grid: Story = {};
export const Dots: Story = { args: { variant: "dots" } };
export const Waves: Story = { args: { variant: "waves" } };
export const Transparent: Story = { args: { backgroundColor: "transparent" } };
