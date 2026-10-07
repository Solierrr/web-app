import type { Meta, StoryObj } from "@storybook/react-vite";
import { SidebarOption } from "./Sidebar.reusables";
const meta = {
  title: "Layout/Sidebar/Option",
  component: SidebarOption,
  args: { to: "/pt-BR/projetos", content: "Projetos", icon: "folder" },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SidebarOption>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
