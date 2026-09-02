import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import Textarea from "./Textarea";
import { DefaultTextarea, CharCountTextarea } from "./Textarea.presets";

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  args: {
    name: "description",
    placeholder: "Descreva o produto",
    rows: 4,
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <DefaultTextarea {...args} />,
};

export const CharCount: Story = {
  args: { maxLength: 140 },
  render: (args) => <CharCountTextarea {...(args as ComponentProps<typeof CharCountTextarea>)} />,
};
