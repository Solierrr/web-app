import type { Meta, StoryObj } from "@storybook/react-vite";
import ToolbarAction from "./ToolbarAction";
import { fn } from "storybook/test";
const meta = { title: "UI/ToolbarAction", component: ToolbarAction, args: { label: "Editar registro", icon: "edit", onClick: fn() } } satisfies Meta<
  typeof ToolbarAction
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithText: Story = { args: { content: "Editar" } };
export const Disabled: Story = { args: { disabled: true } };
export const Link: Story = { render: () => <ToolbarAction icon="folder" label="Projetos" content="Projetos" to="/pt-BR/projetos" /> };
export const Animated: Story = { args: { icon: "folder", iconMotion: "folder", label: "Projetos" } };
