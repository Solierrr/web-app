import type { Meta, StoryObj } from "@storybook/react-vite";
import Button from "./Button";
import {
  PrimaryButton,
  WhiteButton,
  WhiteSoftButton,
  WhiteSolidButton,
  SurfaceButton,
  SecondaryButton,
  IconButton,
  LightIconButton,
  SoftIconButton,
} from "./Button.presets";

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

export const Soft: Story = { args: { variant: "soft" } };

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

export const White: Story = {
  render: (args) => <WhiteButton {...args} />,
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

export const FormActions: Story = {
  name: "Formulário / principal e ações secundárias",
  render: () => (
    <div className="flex w-96 max-w-full flex-col gap-2">
      <PrimaryButton variant="soft" content="Salvar" description="Salvar" className="w-full min-h-12" />
      <WhiteSoftButton content="Cancelar" description="Cancelar" className="w-full min-h-12" />
    </div>
  ),
};

export const WhiteSoft: Story = {
  name: "Preset / branco com conteúdo laranja",
  render: (args) => <WhiteSoftButton {...args} icon={{ name: "eye", inverse: true }} />,
};

export const Surface: Story = {
  name: "Preset / fundo uniforme",
  render: (args) => <SurfaceButton {...args} />,
};

export const WhiteSolid: Story = {
  name: "Preset / branco sólido com conteúdo laranja",
  render: (args) => <WhiteSolidButton {...args} />,
};
