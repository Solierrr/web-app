import type { Meta, StoryObj } from "@storybook/react-vite";
import Checkbox from "./Checkbox";
import { fn, expect, userEvent } from "storybook/test";
const meta = { title: "UI/Checkbox", component: Checkbox, args: { label: "Atividade presencial", onChange: fn() } } satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, args }) => {
    const checkbox = canvas.getByRole("checkbox");
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(args.onChange).toHaveBeenCalled();
  },
};
export const Checked: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };
