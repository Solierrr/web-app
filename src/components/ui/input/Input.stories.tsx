import type { Meta, StoryObj } from "@storybook/react-vite";
import Input from "./Input";
import { DefaultInput, SearchInput, PasswordInput } from "./Input.presets";

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  args: {
    name: "email",
    placeholder: "seuemail@email.com",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <DefaultInput {...args} />,
};

export const Rounded: Story = {
  args: { rounded: true },
  render: (args) => <DefaultInput {...args} />,
};

export const Search: Story = {
  args: { name: "search", placeholder: "Pesquisar" },
  render: (args) => <SearchInput {...args} />,
};

export const Password: Story = {
  args: {
    name: "password",
    placeholder: "Sua senha",
    rounded: true,
  },
  render: (args) => <PasswordInput {...args} />,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <DefaultInput {...args} />,
};
