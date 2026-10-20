import type { Meta, StoryObj } from "@storybook/react-vite";
import MessageBubble from "./MessageBubble";
const meta = {
  title: "Layout/Chat/Message bubble",
  component: MessageBubble,
  args: {
    author: "Ana Silva",
    content: "A vistoria foi concluída. Podemos revisar o cronograma da instalação amanhã.",
    timestamp: "2026-10-13T15:00:00Z",
    locale: "pt-BR",
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof MessageBubble>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Received: Story = {};
export const Sent: Story = { args: { own: true, author: "Você" } };
export const Grouped: Story = { args: { showAuthor: false, content: "Os registros já estão na galeria do projeto." } };
export const Assistant: Story = { args: { conversationKind: "assistant", assistant: true, author: "Assistente Solaria" } };
export const LongContent: Story = {
  args: {
    content:
      "Detalhes da revisão:\n\nPrecisamos conferir a estrutura e as conexões antes da próxima etapa.\n\n" +
      "https://solaria.test/" +
      "documentacao".repeat(25),
  },
};

export const DirectTimeline: Story = { args: { presentation: "timeline", conversationKind: "direct" } };
export const GroupTimeline: Story = { args: { presentation: "timeline", conversationKind: "group" } };
export const AssistantTimeline: Story = { args: { presentation: "timeline", conversationKind: "assistant" } };
