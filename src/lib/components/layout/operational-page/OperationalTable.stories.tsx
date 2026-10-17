import type { Meta, StoryObj } from "@storybook/react-vite";
import OperationalTable from "./OperationalTable";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import StatusField from "@@/ui/status-field/StatusField";
import ValueField from "@@/ui/value-field/ValueField";
import Toast from "@@/feedback/toast/Toast";
import { fn } from "storybook/test";

const meta = {
  title: "Layout/OperationalPage/Table",
  component: OperationalTable,
  args: { label: "Itens", columns: [], items: [], getKey: (item: unknown) => String(item), empty: "Nenhum item" },
} satisfies Meta<typeof OperationalTable>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <OperationalTable
      label="Itens"
      items={["Primeiro", "Segundo", "Terceiro", "Quarto", "Quinto", "Sexto"]}
      columns={[{ key: "name", label: "Nome", render: (item: string) => item }]}
      getKey={(item) => item}
      empty="Nenhum item"
    />
  ),
};

export const Loading: Story = {
  render: () => (
    <OperationalTable<string>
      label="Itens"
      items={null}
      columns={[{ key: "name", label: "Nome", render: (item) => item }]}
      getKey={(item) => item}
      empty="Nenhum item"
    />
  ),
};

const catalog = Array.from({ length: 12 }, (_, index) => ({
  id: String(index),
  model: `Aurora ${400 + index * 10}`,
  power: 400 + index * 10,
  approved: index % 3 !== 0,
}));
export const Catalog: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="min-h-screen bg-operational-surface p-6">
      <Toast />
      <OperationalTable
        label="Placas Solares"
        items={catalog}
        getKey={(item) => item.id}
        empty="Nenhuma placa encontrada."
        onRefresh={fn(async () => undefined)}
        columns={[
          { key: "model", label: "Modelo", value: (item) => item.model, render: (item) => item.model },
          { key: "power", label: "Potência", value: (item) => item.power, render: (item) => <ValueField>{item.power} Wp</ValueField> },
          {
            key: "status",
            label: "Situação",
            value: (item) => (item.approved ? "Aprovada" : "Em análise"),
            filterable: true,
            render: (item) => <StatusField state={item.approved ? "approved" : "pending"} label={item.approved ? "Aprovada" : "Em análise"} />,
          },
          {
            key: "actions",
            label: "",
            render: () => (
              <>
                <ToolbarAction icon="eye" label="Visualizar" onClick={fn()} />
                <ToolbarAction icon="edit" label="Editar" onClick={fn()} />
              </>
            ),
          },
        ]}
      />
    </div>
  ),
};
export const Empty: Story = {
  render: () => (
    <OperationalTable<string>
      label="Itens"
      items={[]}
      columns={[{ key: "name", label: "Nome", render: (item) => item }]}
      getKey={(item) => item}
      empty="Nenhum registro por enquanto."
    />
  ),
};
