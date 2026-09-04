import type { Meta, StoryObj } from "@storybook/react-vite";
import WrapperLayout from "./WrapperLayout";

const meta = {
  title: "Layout/Wrappers/WrapperLayout",
  component: WrapperLayout,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof WrapperLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <div className="bg-input-bg p-6">Conteúdo da página</div>,
  },
};

export const WithAdapterSidebar: Story = {
  args: {
    children: <div className="bg-input-bg p-6">Conteúdo da página</div>,
    adapterSidebar: <div className="p-6">Painel lateral (ex.: chat)</div>,
  },
};
