import type { Meta, StoryObj } from "@storybook/react-vite";
import MorphingHexagon from "./MorphingHexagon";
const meta = { title: "UI/MorphingHexagon", component: MorphingHexagon, args: { className: "size-24" } } satisfies Meta<typeof MorphingHexagon>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Animated: Story = {};
export const Paused: Story = { args: { paused: true } };
