import type { Meta, StoryObj } from "@storybook/react-vite";
import MarkdownMessage from "./MarkdownMessage";
const meta = {
  title: "Layout/Chat/Markdown",
  component: MarkdownMessage,
  args: { content: "# Etapas do projeto\n\nRevisar **estrutura** e *conexões*.\n\n- Vistoria\n- Instalação\n\n> Confirmar horário com a equipe." },
} satisfies Meta<typeof MarkdownMessage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Formatted: Story = {};
export const Plain: Story = { args: { content: "Mensagem simples\ncom quebra de linha." } };
