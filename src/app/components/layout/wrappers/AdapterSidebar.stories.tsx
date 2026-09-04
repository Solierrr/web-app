import type { Meta, StoryObj } from "@storybook/react-vite";
import AdapterSidebar from "./AdapterSidebar";

const meta = {
  title: "Layout/Wrappers/AdapterSidebar",
  component: AdapterSidebar,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="h-screen">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AdapterSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <div className="p-6">Painel lateral (ex.: chat)</div>,
  },
};

export const WithCloseButton: Story = {
  args: {
    children: <div className="p-6">Painel lateral (ex.: chat)</div>,
    onClose: () => {},
  },
};
