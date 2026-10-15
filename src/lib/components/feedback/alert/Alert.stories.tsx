import type { Meta, StoryObj } from "@storybook/react-vite";
import Alert from "./Alert";
const meta = {
  title: "Feedback/Alert",
  component: Alert,
  args: { children: "Não foi possível enviar a imagem. Tente novamente.", state: "error" },
} satisfies Meta<typeof Alert>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Error: Story = {};
export const Success: Story = { args: { state: "success", children: "Operação concluída." } };
export const Warning: Story = { args: { state: "warning", children: "Confira os dados antes de continuar." } };
export const Info: Story = { args: { state: "info", children: "As imagens serão enviadas ao salvar." } };
