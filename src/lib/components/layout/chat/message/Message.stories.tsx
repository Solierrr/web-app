import type { Meta, StoryObj } from "@storybook/react-vite";
import Message from "./Message";
import { owner, messages, avatar } from "../../../../../../.storybook/fixtures";
const meta = {
  title: "Layout/Chat/Message",
  component: Message,
  args: { owner, message: messages[0] },
  decorators: [
    (Story) => (
      <div className="w-full max-w-160 rounded-medium bg-operational-surface p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Message>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Received: Story = {};
export const Sent: Story = { args: { message: messages[1] } };
export const Assistant: Story = {
  args: { placeholderAvatar: true, message: { ...messages[0], user: { ...messages[0].user, name: "Assistente Solaria" } } },
};
export const Attachment: Story = {
  args: { message: { ...messages[0], attachments: [{ id: "image", name: "Referência do projeto", type: "image/svg+xml", url: avatar }] } },
};
export const LongText: Story = { args: { message: { ...messages[0], message: "Informações detalhadas do projeto. ".repeat(30) } } };
