import type { Meta, StoryObj } from "@storybook/react-vite";
import Switcher from "./Switcher";
import type { RedirectOption } from "@/shared/types/navigation/navigation";

const options: RedirectOption[] = [
  { content: "Comprador", url: "/" },
  { content: "Fornecedor", url: "/fornecedor" },
];

const meta = {
  title: "UI/Switcher",
  component: Switcher,
  parameters: {
    layout: "centered",
  },
  args: {
    options,
  },
} satisfies Meta<typeof Switcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TwoOptions: Story = {
  args: { options: options.slice(0, 2) },
};

export const ThreeOptions: Story = {
  args: {
    options: [...options, { content: "Profissional", url: "/profissional" }],
  },
};

export const SingleOption: Story = {
  args: { options: [options[0]] },
};
