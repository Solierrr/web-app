import type { Meta, StoryObj } from "@storybook/react-vite";
import SideCanvas from "./SideCanvas";
const meta = {
  title: "Layout/SideCanvas",
  component: SideCanvas,
  args: { centerWidth: "24rem" },
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <main className="relative isolate flex min-h-screen items-center justify-center bg-operational-surface">
        <Story />
        <div className="max-w-96 p-6 text-center">
          <h1 className="text-operational-title font-semi-bold">Centro livre</h1>
          <p className="mt-3 text-operational-muted">Mova o cursor nas laterais para interagir com o canvas.</p>
        </div>
      </main>
    ),
  ],
} satisfies Meta<typeof SideCanvas>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Sides: Story = {};
export const Surrounding: Story = { args: { centerHeight: "16rem" } };
