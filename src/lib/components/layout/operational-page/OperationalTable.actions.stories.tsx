import type { Meta, StoryObj } from "@storybook/react-vite";
import TableRowOptions from "./OperationalTable.actions";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { fn } from "storybook/test";
const meta = {
  title: "Layout/OperationalPage/RowOptions",
  component: TableRowOptions,
  args: {
    name: "Painel Aurora 450",
    children: (
      <>
        <ToolbarAction icon="eye" label="Visualizar" onClick={fn()} />
        <ToolbarAction icon="edit" label="Editar" onClick={fn()} />
        <ToolbarAction icon="trash" label="Remover" onClick={fn()} />
      </>
    ),
  },
} satisfies Meta<typeof TableRowOptions>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
