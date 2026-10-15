import type { Meta, StoryObj } from "@storybook/react-vite";
import Recent from "./Recent";
import { groups, language } from "../../../../../../.storybook/fixtures";
import { fn } from "storybook/test";
const meta = {
  title: "Layout/Sidebar/Recent",
  component: Recent,
  args: { groups, lang: language, context: "storybook-company", collapsed: false, onNavigate: fn() },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Recent>;
export default meta;
type Story = StoryObj<typeof meta>;
export const WithPages: Story = {};
export const Empty: Story = { args: { context: "storybook-empty" } };
export const Collapsed: Story = { args: { collapsed: true } };
