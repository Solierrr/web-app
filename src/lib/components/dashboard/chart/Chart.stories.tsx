import type { Meta, StoryObj } from "@storybook/react-vite";
import Chart from "./Chart";
import { cartesian, distribution } from "../../../../../.storybook/fixtures";
const meta = {
  title: "Dashboard/Chart",
  component: Chart,
  args: { title: "Geração de energia", kind: "area", payload: cartesian, unit: "kWh", monochromatic: true },
  decorators: [
    (Story) => (
      <div className="w-full max-w-160">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Chart>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Area: Story = {};
export const Line: Story = { args: { kind: "line" } };
export const StackedBars: Story = { args: { kind: "bar", stacked: true, monochromatic: false } };
export const Donut: Story = { args: { kind: "donut", payload: distribution, monochromatic: false, unit: undefined } };
export const Sparkline: Story = { args: { kind: "sparkline" } };
