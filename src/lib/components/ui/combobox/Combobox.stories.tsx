import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Combobox from "./Combobox";
const meta = {
  title: "UI/Combobox",
  component: Combobox,
  args: {
    name: "brand",
    label: "Marca",
    value: "",
    onChange: () => {},
    emptyLabel: "Nenhuma marca encontrada",
    options: [
      ["Canadian Solar", "brand-1"],
      ["Trina Solar", "brand-2"],
    ],
  },
  render: function Example(args) {
    const [value, setValue] = useState(args.value);
    return (
      <div className="max-w-96">
        <Combobox {...args} value={value} onChange={setValue} />
      </div>
    );
  },
} satisfies Meta<typeof Combobox>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Catalog: Story = { args: { selectionLabel: true, placeholder: "Escolha uma marca", toggleLabel: "Abrir opções de marca" } };
export const StateCode: Story = {
  args: {
    selectionLabel: false,
    label: "UF",
    name: "state",
    options: [
      ["Minas Gerais", "MG"],
      ["São Paulo", "SP"],
    ],
    placeholder: "UF",
    maxLength: 2,
  },
};
