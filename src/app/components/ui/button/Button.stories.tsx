import type { Meta, StoryObj } from "@storybook/react-vite";
import Button from "./Button";
import { PrimaryButton, SecondaryButton, IconButton, LightIconButton, SoftIconButton } from "./Button.presets";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  args: {
    description: "Ação principal",
    content: "Continuar",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Rounded: Story = {
  args: { rounded: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithIcon: Story = {
  args: { icon: { name: "shoppingCart" } },
};

export const IconOnly: Story = {
  args: { content: undefined, icon: { name: "shoppingCart" } },
};

export const Primary: Story = {
  render: (args) => <PrimaryButton {...args} />,
};

export const Secondary: Story = {
  render: (args) => <SecondaryButton {...args} />,
};

export const IconPreset: Story = {
  name: "Icon",
  render: () => <IconButton description="Adicionar ao carrinho" icon="shoppingCart" />,
};

export const LightIcon: Story = {
  render: () => <LightIconButton description="Adicionar ao carrinho" icon="shoppingCart" />,
};

export const SoftIcon: Story = {
  render: () => <SoftIconButton description="Adicionar ao carrinho" icon="shoppingCart" />,
};
