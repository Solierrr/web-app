import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Input from "./Input";
import { DefaultInput, SearchInput, PasswordInput, CepInput, CnpjInput, UfInput } from "./Input.presets";

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

export const CEP: Story = {
  args: { name: "cep", placeholder: "00000-000" },
  render: (args) => <CepInput name={args.name} placeholder={args.placeholder} />,
};
export const CNPJ: Story = {
  args: { name: "cnpj", placeholder: "00.000.000/0000-00" },
  render: (args) => <CnpjInput name={args.name} placeholder={args.placeholder} />,
};
function StateInputStory() {
  const [value, setValue] = useState("");
  return (
    <UfInput
      name="state"
      label="Estado"
      placeholder="Buscar estado ou sigla"
      value={value}
      onChange={setValue}
      emptyLabel="Nenhum estado encontrado"
    />
  );
}
export const UF: Story = { render: () => <StateInputStory /> };
