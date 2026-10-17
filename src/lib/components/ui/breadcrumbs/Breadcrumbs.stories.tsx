import type { Meta, StoryObj } from "@storybook/react-vite";
import Breadcrumbs from "./Breadcrumbs";
const meta = {
  title: "UI/Breadcrumbs",
  component: Breadcrumbs,
  args: { label: "Navegação", items: [{ label: "Placas Solares", to: "/pt-BR/admin/modelos-de-placa-solar" }, { label: "Novo modelo" }] },
} satisfies Meta<typeof Breadcrumbs>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
