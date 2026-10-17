import type { Meta, StoryObj } from "@storybook/react-vite";
import ChatLayout from "./ChatLayout";
import { owner, messages } from "../../../../../../.storybook/fixtures";
const meta = {
  title: "Layout/Chat/Conversation",
  component: ChatLayout,
  args: { owner, messages },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-160 bg-operational-surface p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatLayout>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Conversation: Story = {};
export const Empty: Story = { args: { messages: [] } };
export const WithAssistant: Story = { args: { assistantId: messages[0].user.id } };
